function validateAnswers(questions, answers) {
  const errors = {};
  
  if (!answers || typeof answers !== 'object') {
    answers = {};
  }

  // Find all answer keys provided
  const providedKeys = Object.keys(answers);
  
  // Find all valid question IDs
  const validKeys = new Set(questions.map(q => q.id));

  // Reject unknown question IDs
  for (const key of providedKeys) {
    if (!validKeys.has(key)) {
      errors[key] = 'Unknown question ID';
    }
  }

  for (const q of questions) {
    const answer = answers[q.id];
    
    // Required check
    if (q.required) {
      if (answer === undefined || answer === null || answer === '') {
        errors[q.id] = 'This field is required';
        continue;
      }
      
      if (q.type === 'checkbox' && Array.isArray(answer) && answer.length === 0) {
        errors[q.id] = 'This field is required';
        continue;
      }
      
      if ((q.type === 'text' || q.type === 'textarea') && typeof answer === 'string' && answer.trim() === '') {
        errors[q.id] = 'This field is required';
        continue;
      }
    }
    
    // Type and constraint checks (only if answer is provided)
    if (answer !== undefined && answer !== null && answer !== '') {
      switch (q.type) {
        case 'text':
        case 'textarea':
          if (typeof answer !== 'string') {
            errors[q.id] = 'Must be text';
          } else {
            // URL validation
            if (q.type === 'text' && q.label && q.label.toLowerCase().includes('url')) {
              try {
                new URL(answer);
              } catch (err) {
                errors[q.id] = 'Must be a valid URL (e.g., https://example.com)';
              }
            }
            // Textarea min length validation
            if (q.type === 'textarea' && q.label && q.label.toLowerCase().includes('pitch') && answer.trim().length < 20) {
              errors[q.id] = 'Please provide a more detailed answer (min 20 characters)';
            }
          }
          break;
        case 'number':
          if (typeof answer !== 'number' || !Number.isFinite(answer)) {
            errors[q.id] = 'Must be a valid finite number';
          }
          break;
        case 'boolean':
          if (typeof answer !== 'boolean') {
            errors[q.id] = 'Must be a boolean (true/false)';
          }
          break;
        case 'dropdown':
          if (!q.options || !q.options.includes(answer)) {
            errors[q.id] = 'Invalid option selected';
          }
          break;
        case 'checkbox':
          if (!Array.isArray(answer)) {
            errors[q.id] = 'Must be an array of selections';
          } else {
            const invalidOptions = answer.filter(val => !q.options || !q.options.includes(val));
            if (invalidOptions.length > 0) {
              errors[q.id] = `Invalid options: ${invalidOptions.join(', ')}`;
            }
          }
          break;
      }
    }
  }
  
  return Object.keys(errors).length > 0 ? { errors } : null;
}

module.exports = { validateAnswers };
