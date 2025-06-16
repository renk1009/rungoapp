import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function QrScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [qrValue, setQrValue] = useState('');

  // Pedir permissão ao montar o componente
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (!isScanning) return; // evita múltiplas leituras

    setIsScanning(false);
    setQrValue(data);

    try {
      const storedLog = await AsyncStorage.getItem('scanLog');
      const log = storedLog ? JSON.parse(storedLog) : {};

      log[data] = (log[data] || 0) + 1;

      await AsyncStorage.setItem('scanLog', JSON.stringify(log));
      console.log(`Leitura registrada para código: ${data}`);
    } catch (error) {
      console.error('Erro ao registrar leitura do QR code:', error);
    }
  };

  if (hasPermission === null) {
    // Permissão ainda não decidida, mostrar loader
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Solicitando permissão para câmera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    // Permissão negada, botão para pedir de novo
    return (
      <View style={styles.container}>
        <Text>Precisamos da sua permissão para usar a câmera.</Text>
        <Button
          title="Permitir"
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isScanning ? (
        <>
          <View style={styles.cameraContainer}>
            <Camera
              style={StyleSheet.absoluteFillObject}
              onBarCodeScanned={handleBarCodeScanned}
              barCodeScannerSettings={{
                barCodeTypes: [Camera.Constants.BarCodeType.qr],
              }}
            />
          </View>
          <Button title="Cancelar" onPress={() => navigation.goBack()} />
        </>
      ) : (
        <>
          <Text style={styles.qrText}>QR Lido: {qrValue}</Text>
          <Button title="Escanear Novamente" onPress={() => setIsScanning(true)} />
          <Button title="Voltar" onPress={() => navigation.goBack()} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  cameraContainer: {
    flex: 1,
    height: 300,
    marginVertical: 20,
    overflow: 'hidden',
    borderRadius: 12,
  },
  qrText: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
  },
});
