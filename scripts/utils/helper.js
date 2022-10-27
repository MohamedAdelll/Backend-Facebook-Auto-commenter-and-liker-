const CryptoJS = require("crypto-js");
const JWT = require("jsonwebtoken");
const url = require("url");

const Jimp = require("jimp");
const fs = require("fs");

const path = require("path");

const { v4: uuidv4 } = require("uuid");

module.exports = {
  DataTable: {
    Create: async (request, build) => {
      const query = url.parse(request.url, true).query;
      query.current_page = query.current_page || 1;
      query.per_page = query.per_page || 10;

      const count = await build(query).count();
      const tableData = await build(query)
        .skip(query.per_page * (query.current_page - 1))
        .limit(query.per_page);
      const mainPath =
        "http://" +
        process.env.DB_HOST +
        ":" +
        process.env.APP_PORT +
        "/users?page=";
      const rootUrl =
        "http://" + process.env.DB_HOST + ":" + process.env.APP_PORT + "/users";
      const lastPage = Math.ceil(count / query.per_page);
      return {
        current_page: query.current_page,
        data: tableData,
        first_page_url: mainPath + query.current_page,
        from: 1,
        last_page: lastPage,
        last_page_url: mainPath + lastPage,
        links: [{ url: rootUrl, label: "&laquo; Previous", active: false }],
        next_page_url: mainPath + query.current_page + 1,
        path: rootUrl,
        per_page: query.per_page,
        prev_page_url: mainPath + query.current_page - 1,
        to: query.per_page,
        total: count,
        current_page: 1,
        // data: [{id: 1, name: "Mustafa Nikolaus I", last_name: "Oswaldo Feeney V", cell_phone: "562-536-9780",…},…]
        // first_page_url: "https://www.jhonpride.ybdweb.com/api/users?page=1"
        // from: 1
        // last_page: 301
        // last_page_url: "https://www.jhonpride.ybdweb.com/api/users?page=301"
        // links: [{url: null, label: "&laquo; Previous", active: false},…]
        // next_page_url: "https://www.jhonpride.ybdweb.com/api/users?page=2"
        // path: "https://www.jhonpride.ybdweb.com/api/users"
        // per_page: "10"
        // prev_page_url: null
        // to: 10
        // total: 3001
      };
    },
    CreateForExtension: async (request, build) => {
      const query = url.parse(request.url, true).query;
      query.draw = query.draw || 1;
      query.start = query.start || 0;
      query.length = query.length || 5;
      query.search = (query["search[value]"] || "").toLowerCase();
      const total = await build(query).count();
      const tableData = await build(query)
        .skip(query.start)
        .limit(query.length);
      return {
        draw: query.draw,
        data: tableData,
        recordsTotal: total,
        recordsFiltered: total,
      };
    },
  },
  Crypto: {
    Hash: (password) => {
      return CryptoJS.HmacSHA256(
        password,
        CryptoJS.HmacSHA1(password, process.env.PASSWORD_HASH).toString()
      ).toString();
    },
    AccessToken: (user) => {
      return JWT.sign(
        { name: user.user_name, ...user },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: "1w" }
      );
    },
  },
  FileSystem: {
    // Domates: {
    //     Ye: () => {
    //         return {
    //             Nasil: {
    //                 SapurSupur: () => {
    //                     Helper.FileSystem.Ye().Nasil.SapurSupur();
    //                     const json = Helper.FileSystem.Ye();
    //                     json.Nasil.SapurSupur();
    //                 }
    //             }
    //         }
    //     }
    // },
    Delete: (path) => {
      fs.unlink(path, (error) => {});
    },
    AppFolder: path.join(__dirname, "../../", "/"),
    Path: (file, folder, name) => {
      const extension = path.extname(file.name);
      const fileName = `${name || uuidv4()}${extension}`;
      return {
        LocalPath: path.join(__dirname, "../../", folder, fileName),
        FolderPath: path.join(folder, fileName).replaceAll("\\", "/"),
      };
    },
    ToFiles: (temp) => {
      const files = [];
      for (let file in temp) {
        files.push(temp[file]);
      }
      return files;
    },
    ToJpeg: (path) => {
      const parts = path.split(".");
      const ext = parts.length > 1 ? parts[parts.length - 1] : "jpg";
      Jimp.read(path, (err, image) => {
        Helper.FileSystem.Delete(path);
        image.write(path.replace(ext, "jpg"));
      });
    },
  },
};
