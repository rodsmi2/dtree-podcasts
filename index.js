var id3 = require("id3-writer");
var writer = new id3.Writer();
var fs = require("fs");
var probe = require("node-ffprobe");
var moment = require("moment");

var oneOff = process.argv[process.argv.length - 3] === "true";

var file = new id3.File(process.argv[process.argv.length - 2]);
var coverImage = oneOff ? new id3.Image("Disciple-Tree-Icon.png") : new id3.Image("broken-bride-square.jpg");

var title = oneOff ? process.argv[process.argv.length - 1] : "A Broken Bride: A Study of 1 Corinthians: " + process.argv[process.argv.length - 1];

var meta = new id3.Meta({
  title: title,
  artist: "Disciple Tree Church ::: Justin Tollison",
  album: oneOff ? "Sermons" : "A Broken Bride: A Study of 1 Corinthians"
}, [coverImage]);

writer.setFile(file).write(meta, (err) => {
  if (err) {
    console.log("oopsie", err);
  } else {
    var stats = fs.statSync(file.path);
    var filename = file.path.split("/").pop();
    var dateSplit = filename.split("-");
    var date = new Date(dateSplit[0] + "-" + dateSplit[1] + "-" + dateSplit[2] + " 10:30:00");

    var titleDate = moment(date).format("MMMM D, YYYY");
    var pubDate = moment(date).format("ddd, DD MMM YYYY");


    // Get duration
    probe(file.path, (err, probeData) => {
      var duration = probeData.format.duration;

      var minutes = Math.floor(duration / 60);
      var seconds = Math.floor(duration - minutes * 60);
      var time = (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
      var imageUrl = oneOff ? "Disciple-Tree-Icon.png" : "broken-bride-square.jpg";

      var template = `
<item>
  <title>${titleDate} - ${title}</title>
  <itunes:author>Disciple Tree Church ::: Justin Tollison</itunes:author>
  <itunes:subtitle></itunes:subtitle>
  <itunes:summary></itunes:summary>
  <itunes:image href="http://discipletreechurch.com/media_files/${imageUrl}"/>
  <enclosure length="${stats.size}" type="audio/mpeg" url="http://discipletreechurch.com/media_files/audio/${filename}"/>
  <guid>http://discipletreechurch.com/media_files/audio/${filename}</guid>
  <pubDate>${pubDate} 10:30:00 CDT</pubDate>
  <itunes:duration>${time}</itunes:duration>
</item>
      `;

      console.log(template);
    });
  }
});
