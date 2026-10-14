/* =========================================================
   DADOS DO SITE
   ---------------------------------------------------------
   "descricao" descreve o que está na foto — o desenho, o
   traço, o lugar do corpo. Nada aqui é inventado sobre o
   cliente ou sobre o motivo da tattoo.

   "frase" é a epígrafe que abre o painel lateral.

   "historia" fica vazio até a Gio contar o relato real.
   ========================================================= */

window.DADOS = {

  /* -------------------------------------------------------
     CONTATO
     -------------------------------------------------------
     WHATSAPP: número oficial da Gio, só dígitos, com DDI e DDD.

     Informado como +55 35 8429-2368. Foi gravado abaixo com o
     nono dígito (9) que todo celular do Brasil tem desde 2016:
         55 · 35 · 9 8429-2368

     Se o número certo for sem o 9, troque para "553584292368".
     Deixando vazio (""), o site não inventa número: os botões
     avisam que o contato não foi informado e indicam o Direct.
     ------------------------------------------------------- */
  whatsapp: "5535984292368",

  /* -------------------------------------------------------
     PARCEIRO — Tiagao Tattoo Crew
     Informado como 35 8877-2292 (8 digitos). Gravado com o
     nono digito que todo celular do Brasil tem desde 2016.
     Se o certo for sem o 9, troque para "553588772292".
     ------------------------------------------------------- */
  whatsappParceiro: "5535988772292",
  instagramParceiro: "https://instagram.com/tiagaotattoocrew",

  instagram: "gio.tattooink",
  instagramUrl: "https://instagram.com/gio.tattooink",
  instagramDireta: "https://ig.me/m/gio.tattooink",
  tiktok: "https://www.tiktok.com/@giovannareis.tattoo?_r=1&_t=ZS-9AU5T5b7Vcj",

  /* -------------------------------------------------------
     PORTFÓLIO
     ------------------------------------------------------- */
  tattoos: [
    {
      arquivo: "assets/tattoos/t01-gato.webp",

      arquivoAlta: "assets/tattoos/t01-gato-4k.webp",
      alt: "Tattoo de gato preto entre estrelas na perna",
      titulo: "Gato entre estrelas",
      frase: "Quem caminha com a noite nunca caminha só.",
      descricao: "Um gato preto de corpo alongado e cauda em espiral, fechado em preto sólido. Em volta dele, estrelas de quatro pontas e fiozinhos de pontilhado. O brilho da peça não vem de tinta clara — vem do que ficou de pele em branco.",
      historia: ""
    },
    {
      arquivo: "assets/tattoos/t03-morcego-lua-b.webp",

      arquivoAlta: "assets/tattoos/t03-morcego-lua-b-4k.webp",
      alt: "Tattoo de criatura alada sob lua crescente no joelho",
      titulo: "Criatura alada sob a lua",
      frase: "Nem tudo que tem asas foi feito para o céu.",
      descricao: "Uma criatura de orelhas longas e asas membranosas, aberta sobre o joelho. Atrás dela, uma lua crescente em vermelho-vinho; abaixo, uma estrela de oito pontas na mesma tinta. O corpo é todo traço fino, com sombra leve só no peito e nas dobras da asa.",
      historia: ""
    },
    {
      arquivo: "assets/tattoos/t04-jack.webp",

      arquivoAlta: "assets/tattoos/t04-jack-4k.webp",
      alt: "Tattoo de Jack Skellington e Zero em moldura, no ombro",
      titulo: "Jack Skellington e Zero",
      obra: "O Estranho Mundo de Jack · Tim Burton, 1993",
      frase: "O que se promete de osso a osso, o tempo não desfaz.",
      descricao: "Jack Skellington dentro de uma moldura de contorno grosso, no ombro: o sorriso costurado, as órbitas vazias, o terno risca de giz e a gravata-borboleta de morcego. Logo abaixo dele aparece o Zero, o cachorro-fantasma de nariz de abóbora. Uma lua crescente e estrelas pequenas completam a cena do lado de fora da moldura.",
      historia: ""
    },
    {
      arquivo: "assets/tattoos/t05-rosa.webp",

      arquivoAlta: "assets/tattoos/t05-rosa-4k.webp",
      alt: "Tattoo de rosa vermelha com pétalas caindo, no braço",
      titulo: "A rosa e as pétalas",
      frase: "Toda rosa guarda a lembrança do que deixou cair.",
      descricao: "Uma rosa vermelha de caule longo descendo pelo braço, com folhas verdes e espinhos marcados um a um. Abaixo da flor, pétalas soltas caem seguindo a linha do braço. Cor fechada, sem contorno preto pesado.",
      historia: ""
    },
    {
      arquivo: "assets/tattoos/t06-lirios.webp",

      arquivoAlta: "assets/tattoos/t06-lirios-4k.webp",
      alt: "Tattoo de lírios em blackwork no antebraço",
      titulo: "Lírios em blackwork",
      frase: "Flor que nasce no escuro aprende a brilhar sozinha.",
      descricao: "Um ramo de lírios abertos ocupando o antebraço. As pétalas são construídas em linha fina e sombra pontilhada; as folhas, em traço mais firme. Blackwork inteiro, sem uma gota de cor.",
      historia: ""
    },
    {
      arquivo: "assets/tattoos/t07-boneca.webp",

      arquivoAlta: "assets/tattoos/t07-boneca-4k.webp",
      alt: "Tattoo colorida de criatura rosa de quatro olhos verdes",
      titulo: "A criatura de quatro olhos",
      frase: "Olha de volta quem é olhado demais.",
      descricao: "Uma criatura rosa encolhida, de orelhas pontudas e quatro olhos verdes de cílios longos espalhados pelo rosto. Ao lado dela, uma mariposa e um par de brilhos em rosa.\n\nContorno preto fechado e cor chapada por dentro: é o registro mais old school de todo o conjunto, e o único em cor cheia.",
      historia: ""
    },
    {
      arquivo: "assets/tattoos/t08-caveira.webp",

      arquivoAlta: "assets/tattoos/t08-caveira-4k.webp",
      alt: "Tattoo de caveira com fitas e ornamentos",
      titulo: "Caveira e fitas",
      frase: "A caveira é o retrato que todos nós vamos ter.",
      descricao: "Uma caveira inclinada, com fitas e ornamentos se enrolando ao redor dela. Pontilhado nas cavidades para dar profundidade, linha limpa em todo o contorno.",
      historia: ""
    },
    {
      arquivo: "assets/tattoos/t10-pescoco.webp",

      arquivoAlta: "assets/tattoos/t10-pescoco-4k.webp",
      alt: "Tattoo ornamental com morcego no pescoço",
      titulo: "Ornamental no pescoço",
      frase: "Há quem use a noite como quem usa uma joia.",
      descricao: "Uma peça ornamental centrada no pescoço: um morcego no meio e traços simétricos abrindo para os dois lados, descendo até as clavículas. Desenhada para acompanhar o pescoço — é o corpo que dita o formato.",
      historia: ""
    },
    {
      arquivo: "assets/tattoos/t11-noiva-processo.webp",

      arquivoAlta: "assets/tattoos/t11-noiva-processo-4k.webp",
      alt: "Processo de tattoo da Noiva Cadáver em moldura, no braço",
      titulo: "Emily, a Noiva Cadáver",
      obra: "A Noiva Cadáver · Tim Burton, 2005",
      frase: "Antes de ficar para sempre, tudo começa como risco.",
      descricao: "Registro feito durante a sessão: a mão enluvada ao lado da peça recém-terminada, com o decalque roxo ainda visível na pele em volta.\n\nDentro da moldura está a Emily — os olhos arregalados, o cabelo comprido, o arranjo de flores na cabeça e o vestido de noiva rasgado. A borboleta pousada na borda não é enfeite solto: é em borboletas que ela se desfaz no fim do filme.",
      historia: ""
    },
    {
      arquivo: "assets/tattoos/t12-braco.webp",

      arquivoAlta: "assets/tattoos/t12-braco-4k.webp",
      alt: "Tattoo de chamas em blackwork descendo pelo antebraço",
      titulo: "Chamas no antebraço",
      frase: "O fogo não pede licença para tomar o seu lugar.",
      descricao: "Chamas em blackwork descendo do cotovelo até o pulso, só contorno, sem preenchimento. A pele que fica livre entre as linhas é o que faz o fogo parecer vivo.",
      historia: ""
    },
    {
      arquivo: "assets/tattoos/t13-dama.webp",

      arquivoAlta: "assets/tattoos/t13-dama-4k.webp",
      alt: "Tattoo de dama em moldura ornamentada, na coxa",
      titulo: "A dama na moldura",
      frase: "Toda moldura é um pedido para que se olhe duas vezes.",
      descricao: "Uma figura feminina de cabelos volumosos e vestido de renda, parada dentro de uma moldura barroca de espelho. Em volta do desenho, uma nuvem de pontilhado se abrindo pela coxa, como se a moldura estivesse se desfazendo na pele.",
      historia: ""
    },
    {
      arquivo: "assets/tattoos/t14-edward.webp",

      arquivoAlta: "assets/tattoos/t14-edward-4k.webp",
      alt: "Tattoo de Edward Mãos de Tesoura em moldura, no antebraço",
      titulo: "Edward Mãos de Tesoura",
      obra: "Edward Mãos de Tesoura · Tim Burton, 1990",
      frase: "Há mãos que só sabem criar ferindo.",
      descricao: "O retrato do Edward dentro de uma moldura ornamentada no antebraço: o cabelo revolto, as cicatrizes no rosto pálido, o traje de couro e as lâminas abertas no lugar das mãos. Sombreado fechado no rosto, linha fina nos arabescos da moldura.",
      historia: ""
    },
    {
      arquivo: "assets/tattoos/t15-noiva.webp",

      arquivoAlta: "assets/tattoos/t15-noiva-4k.webp",
      alt: "Tattoo de figura de Papai Noel em painel listrado, no antebraço",
      titulo: "O Noel no painel listrado",
      frase: "Cada peça nova conversa com a que já estava ali.",
      descricao: "Uma figura de Papai Noel encurvada, de barba longa e casaco de pele, dentro de um painel com listras de bengala doce e azevinho nos cantos. Flocos de neve e estrelas se espalham pela pele ao redor.\n\nFica logo acima da moldura do Edward: é o mesmo braço, sendo montado peça por peça dentro do mesmo universo.",
      historia: ""
    }
  ]
};
