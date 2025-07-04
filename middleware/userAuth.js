import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

const userAuth = async (req,res,next)=>{
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    const token = authHeader.split(" ")[1];

    try {
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET not found in environment variables');
        return res.status(500).json({ message: "Server configuration error" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "Unauthorized: user not found" });
      }
      req.user = user;
      next();
    } catch (err) {
      console.error('JWT verification error:', err.message);
      return res.status(401).json({ message: "Unauthorized: invalid token" });
    }
}

export default userAuth;