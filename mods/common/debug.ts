let previewTime = performance.now();

export function debug(msg: string, data?: Record<string, unknown>) {
  const currentTime = performance.now();
  const deltaTime = currentTime - previewTime;
  previewTime = currentTime;
  const time = new Date().toISOString();
  const timeDiff = deltaTime.toFixed(1);
  if (typeof Deno === "object") {
    const json = JSON.stringify(data);
    console.log(`${time} ${msg} ${json} +${timeDiff}ms`);
  } else {
    console.log(`${time} [DEBUG] ${msg}`, data, `+${timeDiff}ms`);
  }
}
