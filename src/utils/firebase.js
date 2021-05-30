const {firebase} = require("../firebaseConfigure");

async function saveMeme(alias, videoId, start, end) {
    const doc = firebase.firestore().collection('audios').doc(alias)
    const docData = await doc.get()
    if(!docData.exists){
      doc.set({
        alias,
        file: `${videoId}.mp3`,
        time: {
          start,
          end
        },
        videoId
      })
      .then(() => {
        console.log('deu boa');
      }).cath((error) => {
        console.log('deu ruim' + error);
      });
    }else{
      console.log("Já existe")
    }
}

async function getMeme(alias){
   return new Promise((resp)=> {
        firebase.firestore().collection('audios')
        .doc(alias)
        .get()
        .then((response)=>{
            resp(response.data())
        })

    })
   
}

module.exports = {
     getMeme,
     saveMeme
}