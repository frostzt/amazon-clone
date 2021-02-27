exports.handleServerError = (res, error) => {
  console.error(error);
  res.status(500).json({ msg: "Server Error! We're are working on it!" });
};

exports.verifyAuthorityOnContent = (originalUser, candidateUser) => {
  if (originalUser.toString() !== candidateUser.toString()) {
    return true;
  }
  return false;
};
