export type ClassValue = string | undefined | null | { [key: string]: any } | ClassValue[];

export function cn(...inputs: ClassValue[]) {
  return inputs
    .flat()
    .filter((x): x is string => typeof x === "string" && x.length > 0)
    .join(" ");
}
