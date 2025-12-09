import type { UserRepository } from "./userRepository";
import { memoryUserRepository } from "./userRepository.memory";

export const repo: UserRepository = memoryUserRepository;

/* Later if you add Mongo, you only change this file. 

Example:

import { mongoUserRepository } from "./userRepository.mongo";
export const repo: UserRepository = mongoUserRepository;

*/
