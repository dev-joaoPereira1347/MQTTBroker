// ======================
// SUPABASE
// ======================

const engineUrl = 'https://wdklcmftjtdfixjxcmds.supabase.co';
const engineKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2xjbWZ0anRkZml4anhjbWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NjU1MTAsImV4cCI6MjA5NTE0MTUxMH0.RqAmHhEs0O5tGHx-2BxLh6OdQwNByZrNa4LP_SCjC_c';

const supabaseClient = supabase.createClient(
    engineUrl,
    engineKey
);

// ======================
// MQTT
// ======================

const client = mqtt.connect(
    'wss://broker.hivemq.com:8884/mqtt'
);

// ======================
// CONEXÃO MQTT
// ======================

client.on('connect', () => {

    console.log('Conectado ao HiveMQ');

    client.subscribe('fatec/teste/joao/sensor/temperatura');
    client.subscribe('fatec/teste/joao/sensor/umidade');

    alert('Conectado ao HiveMQ');

});

// ======================
// ERROS MQTT
// ======================

client.on('error', (erro) => {

    console.error('Erro MQTT:', erro);

    alert('Erro MQTT: ' + erro.message);

});

// ======================
// RECEBIMENTO MQTT
// ======================

client.on('message', (topico, mensagem) => {

    const valor = mensagem.toString();

    console.log('================================');
    console.log('Mensagem recebida');
    console.log('Tópico:', topico);
    console.log('Valor:', valor);
    console.log('================================');

    alert(
        'MQTT Recebido\n\n' +
        topico +
        '\n' +
        valor
    );

    if (topico === 'fatec/teste/joao/sensor/temperatura') {

        const campoTemperatura =
            document.querySelector('#temperatura');

        campoTemperatura.value = valor;

        campoTemperatura.setAttribute(
            'value',
            valor
        );

    }

    if (topico === 'fatec/teste/joao/sensor/umidade') {

        const campoUmidade =
            document.querySelector('#umidade');

        campoUmidade.value = valor;

        campoUmidade.setAttribute(
            'value',
            valor
        );

    }

});

// ======================
// ENVIAR DADOS AO ESP32
// ======================

function enviar() {

    const nome =
        document.getElementById('nome').value?.trim();

    const grau =
        Number(document.getElementById('grau').value);

    if (!nome) {

        alert('Informe o nome.');
        return;

    }

    if (isNaN(grau) || grau < 0 || grau > 180) {

        alert('O grau deve estar entre 0 e 180.');
        return;

    }

    client.publish(
        'aluno/nome',
        nome
    );

    client.publish(
        'aluno/angulo',
        grau.toString()
    );

    console.log('Nome enviado:', nome);
    console.log('Grau enviado:', grau);

    alert('Dados enviados ao ESP32.');

}

// ======================
// SOLICITAR LEITURA
// ======================

function lerSensores() {

    client.publish(
        'aluno/lerSensores',
        'ler'
    );

    console.log('Solicitação de leitura enviada.');

}

// ======================
// SALVAR NO SUPABASE
// ======================

async function salvar() {

    const nome =
        document.getElementById('nome').value?.trim();

    const grau =
        Number(document.getElementById('grau').value);

    const temperatura =
        Number(document.getElementById('temperatura').value);

    const umidade =
        Number(document.getElementById('umidade').value);

    // Validações

    if (!nome) {

        alert('Informe o nome.');
        return;

    }

    if (isNaN(grau) || grau < 0 || grau > 180) {

        alert('O grau deve estar entre 0 e 180.');
        return;

    }

    if (isNaN(temperatura) || isNaN(umidade)) {

        alert('Primeiro leia os sensores.');
        return;

    }

    try {

        const { data, error } =
            await supabaseClient
                .from('leituras_iot')
                .insert([
                    {
                        nome: nome,
                        grau: grau,
                        temperatura: temperatura,
                        umidade: umidade
                    }
                ])
                .select();

        if (error) {

            console.error(error);

            alert(
                'Erro ao salvar:\n' +
                error.message
            );

            return;

        }

        console.log('Registro salvo:', data);

        alert('Dados salvos com sucesso!');

    } catch (erro) {

        console.error(erro);

        alert(
            'Erro inesperado ao salvar.'
        );

    }

}

// ======================
// DISPONIBILIZA FUNÇÕES
// PARA O HTML
// ======================

window.enviar = enviar;
window.lerSensores = lerSensores;
window.salvar = salvar;
