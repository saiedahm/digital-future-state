// Fail closed: never activate a subscription from an unsigned browser request.
module.exports = async function handler(req,res){
 res.setHeader("Cache-Control","no-store");res.setHeader("Content-Type","application/json; charset=utf-8");
 if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({error:"Method not allowed"});}
 return res.status(503).json({error:"Stripe webhook is not enabled until raw-body signature verification and idempotent subscription updates are implemented."});
};