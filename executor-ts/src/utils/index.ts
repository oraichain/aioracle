// sleep `time` ms
export const sleep = async(time: number) => {
  await new Promise((r) => setTimeout(r, time));
};
