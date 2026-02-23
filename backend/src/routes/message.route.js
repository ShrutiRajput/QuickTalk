import express from 'express';

const router = express.Router();

router.get('/send',(req,res)=>{
    res.send("Message send endpoint")
})

// router.get('/receive',(req,res)=>{
//     res.send('Msg receive endpoint');
// })


export default router;