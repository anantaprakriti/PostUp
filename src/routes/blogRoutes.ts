import { Hono } from "hono";

import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
export const blogRouter=new Hono<{
    Bindings: {
		DATABASE_URL: string,
    JWT_SECRET: string
	},
    Variables:{
        userId: string,
    }

}>();
blogRouter.use("/*", async(c,next)=>{
        const authHeader=c.req.header("authorization") || "";
        const token=await verify(authHeader,c.env.JWT_SECRET);
        if(token){
            c.set("userId",token.id);
            await next();
        }
        else{
            c.status(403);
            return c.json({code:403});
        }

})
blogRouter.post("/post", async (c)=>{
    const prisma=new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
    
      }).$extends(withAccelerate())
      const body=await c.req.json();
      console.log(body);
      const author=c.get("userId");
      const blog=await prisma.post.create(
        {
            data:{
                title:body.title,
                content:body.content,
                authorId:author,
            }
        }
      )
      return c.json({id : blog.id,blog});

})
blogRouter.get("/:id", async (c)=>{
    const prisma=new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
    
      }).$extends(withAccelerate())
      try {
        const id=await c.req.param("id");
      const body=await c.req.json();
      const blog=await prisma.post.findUnique({
        where:{
            id:id
        }
      })

        
      
      return c.json({blog});
      } catch (error) {
        c.status(403);
        return c.json({we_are_fucked: true});
        
      }
    
})
blogRouter.get("/bulk", async (c)=>{
    const prisma=new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
    
      }).$extends(withAccelerate())
      
      try {
        const blog = await prisma.post.findMany();
        return c.json({ blog });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return c.json({ error: 'Failed to fetch blog posts' });
    }
    
    
})
