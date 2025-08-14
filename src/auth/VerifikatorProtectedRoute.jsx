import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Navigate } from 'react-router-dom';
import { Spinner, Center } from '@chakra-ui/react';

const VerifikatorProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [isVerifikator, setIsVerifikator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data: user, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (user && user.role === 'verifikator') {
          setIsVerifikator(true);
        } else {
          setIsVerifikator(false);
        }
      }
      setLoading(false);
    };

    getSessionAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        const getRole = async () => {
          const { data: user } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          if (user && user.role === 'verifikator') {
            setIsVerifikator(true);
          } else {
            setIsVerifikator(false);
          }
        };
        getRole();
      } else {
        setIsVerifikator(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner />
      </Center>
    );
  }

  if (!session || !isVerifikator) {
    return <Navigate to="/verifikator/login" />;
  }

  return children;
};

export default VerifikatorProtectedRoute;