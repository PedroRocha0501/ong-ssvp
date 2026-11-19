export function validarCadastroVoluntario(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    return {
      valido: false,
      mensagem: "Informe os dados do voluntário em formato válido.",
    };
  }

  const { nome, telefone, email, senha } = dados;
  if (!nome || !telefone || !email || !senha) {
    return {
      valido: false,
      mensagem: "Preencha todos os campos obrigatórios.",
    };
  }

  if (
    typeof nome !== "string" ||
    typeof telefone !== "string" ||
    typeof email !== "string" ||
    typeof senha !== "string"
  ) {
    return {
      valido: false,
      mensagem: "Os dados informados devem estar em formato de texto.",
    };
  }

  if (nome.trim() === "" || telefone.trim() === "" || email.trim() === "" || senha.trim() === "") {
    return {
      valido: false,
      mensagem: "Os campos não podem conter apenas espaços.",
    };
  }

  if (senha.length < 8) {
    return {
      valido: false,
      mensagem: "A senha deve ter pelo menos 8 caracteres.",
    };
  }

  return {
    valido: true,
  };
}

export function validarCadastroFamilia(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    return {
      valido: false,
      mensagem: "Informe os dados da família em formato válido.",
    };
  }
  const {
    nome_responsavel,
    telefone,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    quantidade_pessoas,
  } = dados;

  const camposObrigatorios = [nome_responsavel, logradouro, numero, bairro, cidade, estado];

  if (camposObrigatorios.some((campo) => typeof campo !== "string" || campo.trim() === "")) {
    return {
      valido: false,
      mensagem: "Preencha todos os campos obrigatórios.",
    };
  }

  if (!Number.isInteger(quantidade_pessoas) || quantidade_pessoas <= 0) {
    return {
      valido: false,
      mensagem: "Informe uma quantidade de pessoas válida.",
    };
  }

  if (!/^[A-Za-z]{2}$/.test(estado.trim())) {
    return {
      valido: false,
      mensagem: "Informe uma sigla de estado válida, com duas letras.",
    };
  }

  const camposOpcionais = [telefone, cep, complemento];

  if (
    camposOpcionais.some(
      (campo) => campo !== undefined && campo !== null && typeof campo !== "string",
    )
  ) {
    return {
      valido: false,
      mensagem: "Os campos opcionais devem ser textos.",
    };
  }

  return {
    valido: true,
  };
}
export function validarCadastroCategoria(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    return {
      valido: false,
      mensagem: "Informe os dados da categoria em formato válido.",
    };
  }
  const { nome, descricao } = dados;

  if (typeof nome !== "string" || nome.trim() === "") {
    return {
      valido: false,
      mensagem: "Informe o nome da categoria.",
    };
  }

  if (descricao !== undefined && descricao !== null && typeof descricao !== "string") {
    return {
      valido: false,
      mensagem: "A descrição deve ser um texto.",
    };
  }

  return {
    valido: true,
  };
}
export function validarCadastroItem(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    return {
      valido: false,
      mensagem: "Informe os dados do item em formato válido.",
    };
  }

  const { id_categoria, nome, descricao, unidade_medida } = dados;

  if (!Number.isInteger(id_categoria) || id_categoria <= 0) {
    return {
      valido: false,
      mensagem: "Informe uma categoria válida.",
    };
  }

  if (typeof nome !== "string" || nome.trim() === "") {
    return {
      valido: false,
      mensagem: "Informe o nome do item.",
    };
  }

  if (typeof unidade_medida !== "string" || unidade_medida.trim() === "") {
    return {
      valido: false,
      mensagem: "Informe a unidade de medida.",
    };
  }

  if (descricao !== undefined && descricao !== null && typeof descricao !== "string") {
    return {
      valido: false,
      mensagem: "A descrição deve ser um texto.",
    };
  }

  return {
    valido: true,
  };
}
export function validarCadastroDoacao(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    return {
      valido: false,
      mensagem: "Informe os dados da doação em formato válido.",
    };
  }

  const { id_voluntario, observacao } = dados;

  if (!Number.isInteger(id_voluntario) || id_voluntario <= 0) {
    return {
      valido: false,
      mensagem: "Informe um voluntário válido.",
    };
  }

  if (observacao !== undefined && observacao !== null && typeof observacao !== "string") {
    return {
      valido: false,
      mensagem: "A observação deve ser um texto.",
    };
  }

  return {
    valido: true,
  };
}
