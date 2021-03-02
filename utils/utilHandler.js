exports.handleServerError = (res, error) => {
  if (error.kind === 'ObjectId') {
    return res
      .status(404)
      .json({ msg: 'Nothing found with that ID or is invalid!' });
  }

  if (error.kind === 'CastError') {
    return res.status(400).json({ msg: error.message });
  }

  return res
    .status(500)
    .json({ msg: "Server Error! We're are working on it!" });
};

exports.verifyAuthorityOnContent = (originalUser, candidateUser) => {
  if (originalUser.toString() !== candidateUser.toString()) {
    return true;
  }
  return false;
};
