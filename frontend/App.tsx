import { LinkingOptions, NavigationContainer, NavigatorScreenParams } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from 'react-query';
import { linking } from './src/navconfig';
import { Main } from './src/Root';



const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <NavigationContainer linking={linking}>
        <Main />
    </NavigationContainer>
    </QueryClientProvider>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
