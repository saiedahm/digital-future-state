module.exports = async function handler(req,res){
 res.setHeader("Cache-Control","no-store");res.setHeader("Content-Type","application/json; charset=utf-8");
 if(req.method!=="GET"){res.setHeader("Allow","GET");return res.status(405).json({ok:false,error:"Method not allowed"});}
 return res.status(200).json({service:"DIGITAL FUTURE STATE",status:"configuration-check-only",checks:{
  supabaseUrlConfigured:Boolean(process.env.SUPABASE_URL),
  serviceRoleConfigured:Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  allowedOriginsConfigured:Boolean(process.env.APP_ALLOWED_ORIGINS),
  stripeSecretConfigured:Boolean(process.env.STRIPE_SECRET_KEY),
  stripeWebhookSecretConfigured:Boolean(process.env.STRIPE_WEBHOOK_SECRET)
 },note:"Presence checks only; credentials, database connectivity, and payment processing are not tested."});
};