const doNode = true;
const doExpo = false;

if (doNode) {
	let fs = require('fs');

	// buffer.toString() is only available in Node.
	fs.readFile("test_image.png", (err, buffer) => {
		console.log(buffer);

		// Only available in Node.js
		const encoded = buffer.toString('base64');
		console.log(encoded.length);
	});
}

// For Expo, ImagePicker has a field which allows for the reading of the file to be in base64 ( https://docs.expo.dev/versions/latest/sdk/imagepicker/#imagepickerlaunchimagelibraryasyncoptions and https://docs.expo.dev/versions/latest/sdk/imagepicker/#imagepickeroptions ). An example of this in a real application can be found here: https://snack.expo.dev/B1X8Y67kf
// More or less, it should look like this:
if (doExpo) {
	let pickerResult = await ImagePicker.launchImageLibraryAsync({
		base64: true,
		allowsEditing: false,
	});

	// After we get the image in base64 string, we should be able to just send it down the line. We want to make sure that on the mobile client-side, we are limiting the file size to ~4 megabytes, with the best solution to probably scale / crop the image on the client-side before we send it to some set value, like 1920x1920.
}