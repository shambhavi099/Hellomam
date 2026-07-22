const roleMiddleware = (...roles) => {
  return (req, res, next) => {

    console.log("Allowed Roles:", roles);
    console.log("User Role:", req.user?.role);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    next();
  };
};

module.exports = roleMiddleware;