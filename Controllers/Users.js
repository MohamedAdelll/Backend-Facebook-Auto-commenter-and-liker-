const {
  insert,
  list,
  listForExt,
  loginUser,
  updateForList,
  modify,
  changePass,
  remove,
} = require("../services/Users");
const httpStatus = require("http-status");
const { Crypto } = require("../scripts/utils/helper");

const User = require("../models/Users");

const index = (req, res) => {
  Helper.DataTable.Create(req, (query) => {
    return list(query);
  })
    .then((response) => {
      res.status(httpStatus.OK).send(response);
    })
    .catch((e) => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
    });
};

const listForExtension = (req, res) => {
  Helper.DataTable.CreateForExtension(req, (query) => {
    return listForExt(req?.user?._id, query);
  })
    .then((response) => {
      res.status(httpStatus.OK).send(response);
    })
    .catch((e) => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
    });
};

const login = (req, res) => {
  req.body.password = Helper.Crypto.Hash(req.body.password);
  loginUser(req.body)
    .then((user) => {
      if (!user)
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ message: "Username or password incorrect, try again." });
      const currentTime = new Date().getTime();
      user.lastLoginDate = currentTime;
      user = {
        ...user.toObject(),
        tokens: {
          access_token: Helper.Crypto.AccessToken(user),
        },
      };
      delete user.password;

      User.findOneAndUpdate(
        { _id: user._id },
        { lastLoginDate: user.lastLoginDate }
      ).then(() => {
        res.status(httpStatus.OK).send(user);
      });
    })
    .catch((e) => res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e));
};

const create = (req, res) => {
  /* if(req.body?._id){
        modify({ _id : req.body?._id }, req.body).then(updatedPt => {
            res.status(httpStatus.OK).send(updatedPt)
        }).catch(() => res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error : "A problem occurred during the update process."}))
    }else {
        insert(req.body)
            .then(response => {
                res.status(httpStatus.CREATED).send(response);
            }).catch((e) => {
                res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
            });
    } */
  req.body.password = Crypto.Hash(req.body.password);
  if (req.body?._id) {
    modify({ _id: req.body?._id }, req.body)
      .then((updatedPt) => {
        res.status(httpStatus.OK).send(updatedPt);
      })
      .catch(() =>
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .send({ error: "A problem occurred during the update process." })
      );
  } else {
    insert(req.body)
      .then((response) => {
        const arr = [
          { post_type_name: "General Post", user_id: response._id },
          { post_type_name: "Value Post", user_id: response._id },
          { post_type_name: "Offer Post", user_id: response._id },
          { post_type_name: "Ask Post", user_id: response._id },
          { post_type_name: "Soft Sell Post", user_id: response._id },
          { post_type_name: "Engagement Post", user_id: response._id },
          { post_type_name: "Lead Generation Post", user_id: response._id },
          { post_type_name: "Encouragement Post", user_id: response._id },
        ];
        for (var i = 0; i <= arr.length; i++) {
          const postTypes = new PostType(arr[i]);
          postTypes.save();
        }
        res.status(httpStatus.CREATED).send(response);
      })
      .catch((e) => {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
      });
  }
};

const getUpdate = (req, res) => {
  if (!req.params?.id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: "ID information is missing.",
    });
  }
  updateForList(req.params?.id)
    .then((response) => {
      res.status(httpStatus.OK).send(response);
    })
    .catch((e) => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
    });
};

const update = (req, res) => {
  modify({ _id: req.user?._id }, req.body)
    .then((updatedUser) => {
      res.status(httpStatus.OK).send(updatedUser);
    })
    .catch(() =>
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: "A problem occurred during the update process." })
    );
};

const changePassword = (req, res) => {
  req.body.password = Helper.Crypto.Hash(req.body.password);
  req.body.current_password = Helper.Crypto.Hash(req.body.current_password);
  changePass({ _id: req.user?._id }, req.body)
    .then((updated) => {
      if (updated) {
        res
          .status(httpStatus.OK)
          .send({ message: "Password changed successfully." });
      } else {
        res
          .status(httpStatus.BAD_REQUEST)
          .send({ message: "Password change failed." });
      }
    })
    .catch(() =>
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: "A problem occurred during the update process." })
    );
};

const deleteUser = (req, res) => {
  if (!req.params?.id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: "ID information is missing.",
    });
  }
  remove(req.params?.id)
    .then((deletedItem) => {
      if (!deletedItem) {
        return res.status(httpStatus.NOT_FOUND).send({
          message: "There is no such record.",
        });
      }
      res.status(httpStatus.OK).send({ message: "Record has been deleted." });
    })
    .catch((e) =>
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: "A problem occurred during the deletion process." })
    );
};

const updateProfileImage = (req, res) => {
  if (!req?.files?.profile_image) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .send({ error: "You do not have enough data for this operation." });
  }

  const folderPath = Helper.FileSystem.Path(
    req.files.profile_image,
    "uploads/users",
    req?.user?._id
  ).LocalPath;
  Helper.FileSystem.Delete(folderPath);

  req.files.profile_image.mv(folderPath, function (err) {
    Helper.FileSystem.ToJpeg(folderPath);

    if (err) return res.status(httpStatus.BAD_REQUEST).send({ error: err });
    modify({ _id: req?.user?._id }, { profile_image: fileName })
      .then((updatedUser) => {
        res.status(httpStatus.OK).send(updatedUser);
      })
      .catch((e) =>
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
          error:
            "The upload was successful, but there was a problem while recording.",
        })
      );
  });
};

module.exports = {
  index,
  listForExtension,
  create,
  login,
  getUpdate,
  update,
  deleteUser,
  changePassword,
  updateProfileImage,
};
