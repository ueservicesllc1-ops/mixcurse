import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const AudioVisualizer = ({ isPlaying, volume = 1.0 }) => {
  const animationRef = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        Animated.sequence([
          Animated.timing(animationRef, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(animationRef, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isPlaying) {
            animate();
          }
        });
      };
      animate();
    } else {
      animationRef.setValue(0);
    }
  }, [isPlaying, animationRef]);

  const scale = animationRef.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1.0],
  });

  const opacity = animationRef.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1.0],
  });

  return (
    <View style={styles.container}>
      {[...Array(5)].map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              transform: [{ scaleY: scale }],
              opacity: opacity,
              backgroundColor: isPlaying ? '#007AFF' : '#333',
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  bar: {
    width: 4,
    height: 20,
    marginHorizontal: 2,
    borderRadius: 2,
  },
});

export default AudioVisualizer;

