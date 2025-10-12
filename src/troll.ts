export function jolaDetector(name: string): boolean {
  return /^(jol.*|j)$/gim.test(name);
}
