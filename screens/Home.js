import { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import appFirebase from "../credencials";

const auth = getAuth(appFirebase);

export default function Home() {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // El usuario está autenticado, actualiza el correo electrónico
        setUserEmail(user.email);
      } else {
        // El usuario no está autenticado, establece el correo electrónico en null
        setUserEmail(null);
      }
    });

    // Devuelve una función de limpieza para desuscribirse cuando el componente se desmonte
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "left",
  },
});
