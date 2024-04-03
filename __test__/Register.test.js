import React from "react";

// Importa la función createAccount
import { createAccount } from "../screens/Register";

describe('checkEmail function', () => {
    it('should return true for a valid email', () => {
      // Arrange
      const validEmail = 'test@example.com';
  
      // Act
      const result = checkEmail(validEmail);
  
      // Assert
      expect(result).toBe(true);
    });
  
    it('should return false for an invalid email', () => {
      // Arrange
      const invalidEmail = 'invalidemail';
  
      // Act
      const result = checkEmail(invalidEmail);
  
      // Assert
      expect(result).toBe(false);
    });
  });