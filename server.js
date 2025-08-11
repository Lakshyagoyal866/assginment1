var express = require("express");
var fileuploader = require("express-fileupload");
var cloudinary = require("cloudinary").v2;
var mysql2 = require("mysql2");


var app = express();
app.use(fileuploader());
app.use(express.static("public"));


app.use(express.urlencoded(true));


app.listen(6759, function () {
    console.log("server started at port no. 6759")
})

let dbConfig = "mysql://avnadmin:AVNS_J68UNWC0Cgkxzv836L5@mysql-2a4d8057-lakshyagoyal584.c.aivencloud.com:20103/defaultdb"
let conn = mysql2.createConnection(dbConfig);

conn.connect(function (err) {
    if (err == null) {
        console.log("sucessfully run !!");
    }
    else
        console.log(err.message);
})//conected to aiven 


//for index
app.get("/", function (req, resp) {
    // console.log(__dirname);
    let path = __dirname + "/public/index.html";
    resp.sendFile(path);
})




app.post("/addSchool", async function (req, resp){

        let address = req.body.txtAdr;
         let name = req.body.txtname;
         let latitude = parseFloat(req.body.txtlatitude);
         let longitude = parseFloat(req.body.txtlongitude);

  if (!name || !address || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return resp.status(400).send("All fields are required and must be valid.");
  }
  else{
        conn.query("insert into schools  values(0,?,?,?,?)", [name,address,latitude,longitude], function (errKuch) {
        if (errKuch == null)
            resp.send("school added sucessfully..");
        else
            resp.send(errKuch.message);
    })
}
    });

app.get("/listSchools", function (req, resp){

 let distance =parseFloat( req.query.disKuch);
     let userLat = parseFloat(req.query.lat);
    let userLng = parseFloat(req.query.lng);

      conn.query("select * from schools",function (err, allRecords) {
         if (err) {
            return res.status(500).send(err.message);
        }

        // Calculate distance for each school
        let schoolsWithDistance = allRecords.map(school => {
            let dist = calculateDistance(
                userLat,
                userLng,
                parseFloat(school.latitude),
                parseFloat(school.longitude)
            );
            return { ...school, distance: dist.toFixed(2) };
        });
         schoolsWithDistance.sort((a, b) => a.distance - b.distance);

          resp.json(schoolsWithDistance);

    })


 
    });



function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const toRad = deg => deg * (Math.PI / 180);

    let dLat = toRad(lat2 - lat1);
    let dLon = toRad(lon2 - lon1);

    let a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
}



