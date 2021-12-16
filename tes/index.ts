import {Snake} from "tgsnake"
import RateLimit from "../src"

const bot = new Snake() 
bot.use(RateLimit({
  windows : 5000,
  limit : 1,
  onLimited : (ctx) => {
    //@ts-ignore
    if(ctx.message){ 
      //@ts-ignore
      return ctx.message.reply("Limit exceeded.")
    }
  }
}))
bot.cmd("start",(ctx)=>{
  return ctx.reply("Starting!")
})
bot.run()