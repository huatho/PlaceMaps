export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
