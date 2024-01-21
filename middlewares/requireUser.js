const jwt = require("jsonwebtoken");
const { error } = require("../utils/responseWrapper");

module.exports = async (req, res, next) => {
  try {
    if (
      !req.headers ||
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer")
    ) {
        return res.send(error(401, "Authorization header is required"));
    } 
    const accessToken = req.headers.authorization.split(" ")[1];
    if(!accessToken){
      return res.send(error(401,"Invalid Access key"))
    }
    const decode = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);
    req.id = decode.id;
    next();
  } catch (e) {
    console.log(e);
    return res.send(error(401, "Invalid access key"));
  }
};
