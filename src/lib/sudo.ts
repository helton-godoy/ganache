export const sudo = {
  exec: async (command: string): Promise<string> => {
    console.log(`[Stub Sudo] Executing: ${command}`);
    return "";
  },
};
