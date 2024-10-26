if (results.length > 0) {
    // Login bem-sucedido como professor
    return res.status(200).json({ success: true, role: 'professor', email: results[0].Email }); // Inclua o email
  } else {
    // Credenciais inválidas
    return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
  