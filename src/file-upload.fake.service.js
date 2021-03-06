'use strict'

function upload(formData) {
    const photos = formData.getAll('photos');
    // debe de traer solo una imagen
    const promises = photos.map((x) => getImage(x)
        .then(img => ({
            id: img,
            originalName: x.name,
            fileName: x.name,
            url: img
        })));
    return Promise.all(promises);
}

function getImage(file) {
    return new Promise((resolve, reject) => {
        const fReader = new FileReader();
        const img = document.createElement('img');

        fReader.onload = () => {
            img.src = fReader.result;
            resolve(getBase64Image(img));
        }

        fReader.readAsDataURL(file);
    })
}

function getBase64Image(img) {
    const canvas = document.createElement('canvas');

    const imageSizes =[
        { imageType: "androidThumbXxhdpi", width:231, height:  165},
        { imageType: "androidThumbXhdpi", width:154, height:  110},
        { imageType: "androidThumbHdpi", width:115, height:  82},
        { imageType: "androidThumbMdpi", width:77, height:  55},
        { imageType: "androidFullXxhdpi", width:231, height:  165},
        { imageType: "androidFullXhdpi", width:632, height:  398},
        { imageType: "androidFullHdpi", width:474, height:  299},
        { imageType: "androidFullMdpi", width:316, height:  199},
        { imageType: "iosLargeHighRes", width:540, height:  340},
        { imageType: "iosLarge", width:270, height:  170},
        { imageType: "iosThumbHighRes", width:164, height:  104},
        { imageType: "iosThumb", width:82, height:  52},
        { imageType: "ImageStrip", width:640, height:  246},
        { imageType: "ImageLarge", width:261, height:  164},
        { imageType: "ImageMedium", width:165, height:  104},
        { imageType: "ImageSmall", width:115, height:  72},
        { imageType: "ImageIcon", width:88, height:  55},        
    ]

    const newSize ={
        width: 231,
        height: 156
    }
    //canvas.width = img.width;
    canvas.height = newSize.width;
    //canvas.width = img.width;
    canvas.height = newSize.height;

    const ctx = canvas.getContext('2d');
    //ctx.scale(5,5);
    ctx.drawImage(img, 0, 0, newSize.width, newSize.height);

    const dataURL = canvas.toDataURL('image/png');
    //console.log(dataURL);
    //dataURL = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");

    return dataURL;
}

export { upload }

