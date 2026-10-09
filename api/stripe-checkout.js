// Payment is intentionally disabled until Stripe is securely configured and tested.
module.exports = async function handler(req,res){
 res.setHeader("Cache-Control","no-store");res.setHeader("Content-Type","application/json; charset=utf-8");
 if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({error:"Method not allowed"});}
 return res.status(503).json({error:"Payments are not enabled. Configure authenticated checkout, approved Stripe price IDs, and server-side validation before accepting money."});
};