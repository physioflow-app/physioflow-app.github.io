function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const body = new Response(bytes as BodyInit).body!.pipeThrough(stream);
  return new Uint8Array(await new Response(body).arrayBuffer());
}

const canCompress = () => typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';

/** JSON -> URL-safe text. Compressed ("z.") when the browser supports it, plain ("j.") otherwise. */
export async function encodeJson(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  if (canCompress()) return `z.${toBase64Url(await pipe(bytes, new CompressionStream('deflate-raw')))}`;
  return `j.${toBase64Url(bytes)}`;
}

export async function decodeJson(text: string): Promise<unknown> {
  const [kind, data] = [text.slice(0, 2), text.slice(2)];
  let bytes = fromBase64Url(data);
  if (kind === 'z.') {
    if (!canCompress()) throw new Error('This browser cannot open compressed share links.');
    bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
  } else if (kind !== 'j.') {
    throw new Error('Unrecognized share link.');
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
