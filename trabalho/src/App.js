import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/login';
import HomeAluno from './components/homeAluno';
import HomeProfessor from './components/homeProfessor';
import Register from './components/register';
import CadastrarTurma from './components/cadastrarTurmas';
import CadastrarSala from './components/cadastrarSala';
import CadastrarDisciplina from './components/cadastrarDisciplina';
import Professor from './components/editarProfessor';
import ReactivatePage from './components/reactivatePage';
import CadastrarAluno from './components/CadastrarAluno';
function App() {
  return (
    <Router>
      <Routes>
        {/* Rota raiz redirecionando para login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home-aluno" element={<HomeAluno />} />
        <Route path="/home-professor" element={<HomeProfessor />} />
        <Route path="/cadastrar-turma" element={<CadastrarTurma />} />
        <Route path="/cadastrar-sala" element={<CadastrarSala />} />
        <Route path="/cadastrar-disciplina" element={<CadastrarDisciplina />} />
        <Route path="/editar-professor" element={<Professor />} />
        <Route path="/reativar" element={<ReactivatePage />} />
        <Route path="/cadastrar-aluno" element={<CadastrarAluno />} />
      </Routes>
    </Router>
  );
}

export default App;
