"use server";

export async function logMessage(message: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO', meta?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
    console.log(`[${timestamp}] [${level}] [CLIENT-LOG] ${message}${metaString}`);
}

