export interface EmailProvider {
  sendPasswordReset(to: string, resetLink: string): Promise<void>;
}
