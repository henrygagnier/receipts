import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Image,
} from "react-native";
import * as FileSystem from "expo-file-system";

export default function App() {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const cameraRef = useRef(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  async function takePhoto() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      Alert.alert("Success", "You took a photo");
      setPhoto(photo.uri);
      setReceiptData(null); // Reset receipt data for a new photo
    }
  }

  async function uploadPhoto() {
    if (!photo) {
      Alert.alert("Error", "No photo to upload");
      return;
    }

    try {
      const fileUri = photo;

      const formData = new FormData();
      formData.append("file", {
        uri: fileUri,
        type: "image/jpeg", 
        name: "receipt.jpg",
      });

      const response = await fetch(
        "https://receipts-phi.vercel.app/process-receipt/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data =  response.json();
        console.log("Data", data)
        setReceiptData(data); // Display parsed receipt data
      } else {
        const error = response.text();
        //Alert.alert("Error", error.detail || error);
        console.log("Error!", error.detail || error);
      }
    } catch (error) {
      Alert.alert("hi");
      console.log("BIG Error", error.message);
      //Alert.alert("Error", `Something went wrong: ${error.message}`);
    }
  }

  return (
    <View style={styles.container}>
      {photo ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo }} style={styles.imagePreview} />
          <View style={styles.buttonContainerPreview}>
            <TouchableOpacity
              onPress={() => setPhoto(null)}
              style={styles.buttonPreview}
            >
              <Text style={styles.text}>Take Another</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={uploadPhoto}
              style={styles.buttonPreview}
            >
              <Text style={styles.text}>Upload Photo</Text>
            </TouchableOpacity>
          </View>
          {receiptData && (
            <View style={styles.receiptContainer}>
              <Text style={styles.receiptTitle}>Receipt Data:</Text>
              <Text style={styles.receiptText}>
                {JSON.stringify(receiptData, null, 2)}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          <View style={styles.buttonContainerCamera}>
            <TouchableOpacity
              style={[styles.button, styles.flipButton]}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.captureButton]}
              onPress={takePhoto}
            >
              <Text style={styles.text}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: "#fff",
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  buttonContainerCamera: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    padding: 20,
  },
  buttonContainerPreview: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    alignItems: "center",
  },
  button: {
    padding: 15,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
  },
  flipButton: {
    backgroundColor: "rgb(34 197 94)",
  },
  captureButton: {
    backgroundColor: "rgb(34 197 94)",
  },
  buttonPreview: {
    backgroundColor: "rgb(34 197 94)",
    width: 200,
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  imagePreview: {
    width: "100%",
    height: "70%",
    resizeMode: "contain",
  },
  receiptContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#222",
    borderRadius: 10,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  receiptText: {
    fontSize: 14,
    color: "#ddd",
  },
});
