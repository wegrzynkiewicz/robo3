export function debug(msg: string, data?: Record<string, unknown>) {
  const tm = (new Date()).toISOString();
  const json = JSON.stringify({tm, msg, data})
  console.log(json);
}
