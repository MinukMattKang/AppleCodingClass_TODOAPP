const express = require('express');
const app = express();
// body-parser는 요청 데이터(body) 해석을 쉽게 도와주는 라이브러리
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
// method-override 라이브러리(PUT, DELETE 사용 가능)
const methodOverride = require('method-override');
const req = require('express/lib/request');
const res = require('express/lib/response');
app.use(methodOverride('_method'));
// mongoDB 접속 
const MongoClient = require('mongodb').MongoClient
app.set('view engine', 'ejs');

app.use('/public', express.static('public'));



var db;

MongoClient.connect('mongodb+srv://Goouk:Goouk123@goouk.ug9mm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', function(error, client){
    // 연결되면 할 일
    if (error) return console.log(error);

    db = client.db('todoapp');

    // app.listen(서버포트, 작업내용)
    app.listen(8080, function(){
    console.log('listening on 8080')
});
})



// app.get('경로', 작업내용)
// app.get('경로', function(요청내용, 응답방법){})
// 함수 안에 함수가 들어가는 것을 콜백함수라고 부름, 순차적으로 실행하고플 때 사용
app.get('/pet', function(req, res){
    res.send('펫용품 쇼핑할 수 있는 페이지입니다.');
});

app.get('/beauty', function(req, res){
    res.send('뷰티용품 쇼핑할 수 있는 페이지입니다.');
});

app.get('/', function(req, res){
    // 브라우저는 .html파일만 인식하고 .ejs파일을 모르기 때문에 render를 통해서 변환. html 파일은 sendFile() 사용
    // res.sendFile(__dirname + '/index.ejs');
    res.render('index.ejs');
});

app.get('/write', function(req, res){
    // res.sendFile(__dirname + '/views/write.ejs');
    res.render('write.ejs');
});

// app.post('경로', function(){})
app.post('/add', function(req, res){
    // res.send('전송완료');
    res.redirect('/list');

    var title = req.body.title;
    var date = req.body.date;

    db.collection('counter').findOne({ name : 'numberOfPosts'}, function(error, result){
        console.log('지금까지 저장된 항목 : ' + result.totalPost);
        var numberOfPosts = result.totalPost;

        //~.insertOne('저장할 데이터(Object형식)', function(에러, 결과){})
        db.collection('post').insertOne( { _id : numberOfPosts + 1, 할일 : title, 날짜 : date}, function(error, result){
        console.log('저장완료');
        // counter라는 콜렉션에 있는 totalPost 라는 항목도 수정하여 증가시켜야함
        // update({수정값}, { $operator : {수정 내용}}, function(){})
        db.collection('counter').updateOne({ name : 'numberOfPosts'}, { $inc : { totalPost : 1 } }, function(error, result){

            if(error) {
                return console.log(error);
            }
        });
        
        });
    });
    console.log(req.body);
});

// list로 GET요청으로 접속하면 실제 DB에 저장된 데이터로 꾸며진 HTML을 보여줌
app.get('/list', function(req, res){

    // 1. 데이터를 꺼내고
    db.collection('post').find().toArray(function(error, result){
        console.log(result);

    // 2. 화면을 보여준다
    res.render('list.ejs', { posts : result });
    });
});

// DELETE 요청
app.delete('/delete', function(req, res){
    console.log(req.body);

    req.body._id = parseInt(req.body._id);

    db.collection('post').deleteOne(req.body, function(error, result){
        console.log('삭제완료');
        res.status(200).send({ message : '성공했습니다' });
    });
});

// 상세페이지(URL 파라미터 설정)
app.get('/detail/:id', function(req, res){

    req.params.id = parseInt(req.params.id);

    db.collection('post').findOne({ _id : req.params.id }, function(error, result){
        console.log(result);
        if (result != null) {
            res.render('detail.ejs', { data : result });
        } else {
            res.status(400).send({ message : '존재하지 않는 내용입니다' });
        }
    });
});

// edit 페이지
app.get('/edit/:id', function(req, res){

    req.params.id = parseInt(req.params.id);

    db.collection('post').findOne({ _id : req.params.id }, function(error, result){
        console.log(result);
        if (result != null) {
            res.render('edit.ejs', { data : result });
        } else {
            res.status(400).send({ message : '존재하지 않는 내용입니다' });
        }
    });
});

app.put('/edit', function(req, res){
    // updateOne({대상}, {수정값}, 콜백함수)
    db.collection('post').updateOne({ _id : parseInt(req.body.id) }, { $set : { 할일 : req.body.title, 날짜 : req.body.date } }, function(error, result){
        console.log('수정완료');
        res.redirect('/list');
    });
});
