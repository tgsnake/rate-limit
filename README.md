## Overview 
This is a official plugin from tgsnake for rate limiting.   
This plugin can rerun the pending update after limit exceeded.  

## Installation 
You must install tgsnake first before installing this plugin.  

```bash
npm i --save tgsnake @tgsnake/rate-limit
```

## Example use.
```ts
//index.ts 
import RateLimit from "@tgsnake/rate-limit" 

bot.use(RateLimit({
  windows : 3000,
  limit : 1,
  onLimited : () => {
    return console.log("Limit exceeded.")
  }
}))
```

## Options 
```ts 
interface RateLimitOptions {
  /**
   * how long to keep the data in memory. (default 1000)
  */
  windows?:number; 
  /**
   * max request during windows. (default 1)
  */
  limit?:number;
  /**
   * what to do after the limit is exceeded. (default will rerun the pending updates)
  */
  afterLimited?:(ctx:Updates.TypeUpdate) => MaybePromise<any>; 
  /**
   * what to do if the limit is exceeded. (default will pending the update.)
  */
  onLimited?:(ctx:Updates.TypeUpdate) => MaybePromise<any>; 
  /**
   * function to generate key. it must be return a bigint.
  */
  keyGenerator?:(ctx:Updates.TypeUpdate) => MaybePromise<bigint>;
}
```
  
Build with ♥️ by [tgsnake dev](https://t.me/+Fdu8unNApTg3ZGU1).