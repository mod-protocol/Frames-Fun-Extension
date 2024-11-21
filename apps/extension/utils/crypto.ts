export type UserID = `${string}-${string}-${string}-${string}-${string}`

export function generateRandomUserId(): UserID {
  // generate random user id using crypto
  return crypto.randomUUID()
}
