import express from "express"
import redis from "redis"
const app = express();
const client = redis.createClient();

await client.connect()

// serve static files from public directory
app.use(express.static("public"));

await client.mSet(["header", 0, "left", 0, "article", 0, "right", 0, "footer", 0]);

const data = () => new Promise(async (resolve, reject) => {

    client.mGet(["header", "left", "article", "right", "footer"])
        .then(value => {
            const data = {
                header: Number(value[0]),
                left: Number(value[1]),
                article: Number(value[2]),
                right: Number(value[3]),
                footer: Number(value[4]),
            }
            resolve(data)
        })
        .catch(() => reject())

});


app.get("/data", (req, res) => {
    data()
        .then(data => {
            console.log(data);
            res.send(data);
        })
        .catch(err => console.log(err))
});

app.get("/update/:key/:value", function (req, res) {
    const key = req.params.key;
    let value = Number(req.params.value);
    client.get(key, function (err, reply) {
        value = Number(reply) + value;
        client.set(key, value);
        
        data().then((data) => {
            console.log(data);
            res.send(data);
        });
    });
});

app.listen(3000, () => {
    console.log("Running on 3000");
});

process.on("exit", function () {
    client.quit();
});