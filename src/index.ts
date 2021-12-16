// Tgsnake - Telegram MTProto framework developed based on gram.js.
// Copyright (C) 2021 Butthx <https://github.com/butthx>
//
// This file is part of Tgsnake
//
// Tgsnake is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.

import { run } from 'tgsnake/lib/Context/Composer';
import * as Updates from 'tgsnake/lib/Update';
import { BotError } from 'tgsnake';

type MaybePromise<T> = T | Promise<T>;
class MemoryStore {
  hits!: Map<bigint, number>;
  date: number = Date.now();
  constructor(clearPeriod: number) {
    this.hits = new Map();
    setInterval(this.reset.bind(this), clearPeriod);
  }
  incr(key: bigint) {
    let counter = this.hits.get(key) || 0;
    counter++;
    this.hits.set(key, counter);
    return counter;
  }
  reset() {
    return this.hits.clear();
  }
}
export interface RateLimitOptions {
  /**
   * how long to keep the data in memory. (default 1000)
   */
  windows?: number;
  /**
   * max request during windows. (default 1)
   */
  limit?: number;
  /**
   * what to do after the limit is exceeded. (default will rerun the pending updates)
   */
  afterLimited?: (ctx: Updates.TypeUpdate) => MaybePromise<any>;
  /**
   * what to do if the limit is exceeded. (default will pending the update.)
   */
  onLimited?: (ctx: Updates.TypeUpdate) => MaybePromise<any>;
  /**
   * function to generate key. it must be return a bigint.
   */
  keyGenerator?: (ctx: Updates.TypeUpdate) => MaybePromise<bigint>;
}
function RateLimit(options?: RateLimitOptions) {
  const config = Object.assign(
    {
      windows: 1000,
      limit: 1,
      afterLimited: async (ctx) => {
        try {
          if (ctx.snakeClient) {
            await run(ctx.snakeClient.middleware(), ctx);
          }
          if (ctx.SnakeClient) {
            await run(ctx.snakeClient.middleware(), ctx);
          }
          return ctx;
        } catch (error: any) {
          if (!(error instanceof BotError)) {
            let botError = new BotError();
            botError.error = error;
            botError.functionName = `RateLimit.afterLimited`;
            botError.functionArgs = `[Update]`;
            throw botError;
          }
          throw error;
        }
      },
      onLimited: (ctx) => {},
      keyGenerator: (ctx) => {
        if (ctx instanceof Updates.UpdateNewChannelMessage) {
          ctx as Updates.UpdateNewChannelMessage;
          return ctx.message.chat.id as bigint;
        }
        if (ctx instanceof Updates.UpdateNewMessage) {
          ctx as Updates.UpdateNewMessage;
          return ctx.message.chat.id as bigint;
        }
        if (ctx instanceof Updates.UpdateBotCallbackQuery) {
          ctx as Updates.UpdateBotCallbackQuery;
          return (ctx.message?.chat.id || ctx.from.id) as bigint;
        }
        if (ctx instanceof Updates.UpdateShortMessage) {
          ctx as Updates.UpdateShortMessage;
          return ctx.message.chat.id as bigint;
        }
        if (ctx instanceof Updates.UpdateShortChatMessage) {
          ctx as Updates.UpdateShortChatMessage;
          return ctx.message.chat.id as bigint;
        }
      },
    },
    options
  );
  const store = new MemoryStore(config.windows);
  return (ctx, next) => {
    const key = config.keyGenerator(ctx);
    if (!key && typeof key !== 'bigint') {
      return next();
    }
    const hit = store.incr(key as bigint);
    const onLimited = (_ctx) => {
      setTimeout(() => {
        return config.afterLimited(_ctx);
      }, config.windows);
      return config.onLimited(_ctx);
    };
    return hit <= config.limit ? next() : onLimited(ctx);
  };
}
export default RateLimit;
