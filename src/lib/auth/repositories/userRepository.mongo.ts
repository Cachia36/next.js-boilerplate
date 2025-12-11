import { ObjectId } from "mongodb";
import type { DbUser, UserRole } from "@/types/user";
import type { UserRepository, CreateUserInput } from "./userRepository";
import { getDb } from "@/lib/db/mongoClient";
import { NotFound, Conflict } from "@/lib/errors";

type UserDocument = {
  _id?: ObjectId;
  email: string;
  role: UserRole;
  passwordHash: string;
  createdAt: Date;
  passwordResetToken: string | null;
  passwordResetExpiresAt: Date | null;
};

const COLLECTION = "users";

function mapDocToDbUser(doc: UserDocument): DbUser {
  if (!doc._id) {
    throw new Error("User document is missing _id");
  }

  return {
    id: doc._id.toHexString(),
    email: doc.email,
    role: doc.role,
    passwordHash: doc.passwordHash,
    createdAt: doc.createdAt.toISOString(),
    passwordResetToken: doc.passwordResetToken,
    passwordResetExpiresAt: doc.passwordResetExpiresAt
      ? doc.passwordResetExpiresAt.toISOString()
      : null,
  };
}

export const mongoUserRepository: UserRepository = {
  async findByEmail(email) {
    const db = await getDb();
    const normalizedEmail = email.trim().toLowerCase();

    const col = db.collection<UserDocument>(COLLECTION);
    const doc = await col.findOne({ email: normalizedEmail });

    return doc ? mapDocToDbUser(doc) : null;
  },

  async findById(id) {
    const db = await getDb();

    const col = db.collection<UserDocument>(COLLECTION);
    const doc = await col.findOne({ _id: new ObjectId(id) });

    return doc ? mapDocToDbUser(doc) : null;
  },

  async createUser(data: CreateUserInput) {
    const db = await getDb();
    const normalizedEmail = data.email.trim().toLowerCase();

    const col = db.collection<UserDocument>(COLLECTION);

    // same behaviour as memory repo
    const existing = await col.findOne({ email: normalizedEmail });
    if (existing) {
      throw Conflict("User already exists", "AUTH_EMAIL_ALREADY_EXISTS");
    }

    const now = new Date();

    const newUserDoc: UserDocument = {
      email: normalizedEmail,
      role: data.role,
      passwordHash: data.passwordHash,
      createdAt: now,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    };

    const result = await col.insertOne(newUserDoc);

    return {
      id: result.insertedId.toHexString(),
      email: normalizedEmail,
      role: data.role,
      passwordHash: data.passwordHash,
      createdAt: now.toISOString(),
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    };
  },

  async updatePassword(userId, passwordHash) {
    const db = await getDb();
    const res = await db
      .collection(COLLECTION)
      .updateOne({ _id: new ObjectId(userId) }, { $set: { passwordHash } });

    if (res.matchedCount === 0) {
      throw NotFound("User does not exist", "USER_NOT_FOUND");
    }
  },

  async setPasswordResetToken(userId, token, expiresAt) {
    const db = await getDb();
    const res = await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          passwordResetToken: token,
          passwordResetExpiresAt: expiresAt,
        },
      },
    );

    if (res.matchedCount === 0) {
      throw NotFound("User does not exist", "USER_NOT_FOUND");
    }
  },

  async findByPasswordResetToken(token) {
    const db = await getDb();
    const now = new Date();

    const col = db.collection<UserDocument>(COLLECTION);
    const doc = await col.findOne({
      passwordResetToken: token,
      passwordResetExpiresAt: { $gt: now },
    });

    return doc ? mapDocToDbUser(doc) : null;
  },

  async clearPasswordResetToken(userId) {
    const db = await getDb();
    await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          passwordResetToken: null,
          passwordResetExpiresAt: null,
        },
      },
    );
  },
};
