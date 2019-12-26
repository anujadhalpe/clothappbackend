const express = require('express');
const fileUpload = require('express-fileupload');
const mongodb = require('mongodb')
const fs = require('fs')

const app = express()
const router = express.Router()
const mongoClient = mongodb.MongoClient
const binary = mongodb.Binary

router.get('/', (req, res)=>{
    res.sendFile('./index.html', { root : __dirname })
})

router.get('/', (req, res)=>{
    getFiles(res)
})

app.use(fileUpload())

router.post('/upload', (req, res)=>{
    let file = {
        name : req.body.name,
        file : binary(req.files.uploadFile.data)
    }
    insertFile(file, res)
})

function insertFile(file, res){
    mongoClient.connect("mongodb://localhost:27017", { useNewUrlParser : true}, (err, client) =>{
        if(err){
            return err
        }
        else{
            let db = client.db("uploadDB1")
            let collection = db.collection('files1')
            try{
                collection.insertOne(file)
                console.log('File Inserted')
            }
            catch(err){
                console.log('Error while inserting :', err)
            }
            client.close()
            res.redirect('/')
        }
    })
}

function getFiles(res){
    mongoClient.connect('mongodb://localhost:27017', { useNewUrlParser : true }, (err, client) => {
        if (err){
            return err
        }
        else {
            let db = client.db('uploadDB1')
            let collection = db.collection('files1')
            collection.find({}).toArray((err,doc) => {
                if (err){
                    console.log('err in finding doc:', err)
                }
                else {
                    let buffer = doc[0].file.buffer
                    fs.writeFileSync('uploadedImage.jpg', buffer)
                }
            })
            client.close();
            res.redirect('/')
        }
    })
}

app.use("/", router)

app.listen(3000, () => console.log('started on 3000 port'))