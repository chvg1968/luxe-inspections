import { v4 as uuidv4 } from 'uuid';
import { Inspection } from '../types';

export const initialInspection: Inspection = {
  id: uuidv4(),
  title: 'Property Inspection',
  date: new Date().toISOString().split('T')[0],
  property: 'Villa Palacio',
  completed: false,
  sections: [
    {
      id: uuidv4(),
      title: 'General',
      items: [
        { id: uuidv4(), text: 'Puerta principal y pasillo de entrada limpio', checked: false },
        { id: uuidv4(), text: 'Revisar bombillo exterior', checked: false },
        { id: uuidv4(), text: 'Timbre funciona', checked: false },
        { id: uuidv4(), text: 'Entrar preparado con trapo para limpiar y secar', checked: false },
        { id: uuidv4(), text: 'Wifi funcionando, abrir página nueva', checked: false },
        { id: uuidv4(), text: 'Lockbox con llave adentro', checked: false },
      ],
      subsections: [],
      photos: [{
        id: uuidv4(),
        url: 'https://rxudgxowradykfqfwhkp.supabase.co/storage/v1/object/public/photos/villapalacio/Foto 1.jpg',
        caption: 'Foto 1'
      }]
    },
    {
      id: uuidv4(),
      title: 'Áreas Sociales',
      items: [],
      photos: [],
      subsections: [
        {
          id: uuidv4(),
          title: 'Entrada',
          items: [
            { id: uuidv4(), text: 'Sombrilla', checked: false },
            { id: uuidv4(), text: 'Revisar bombillos', checked: false },
            { id: uuidv4(), text: 'Extintor', checked: false },
            { id: uuidv4(), text: '4 toallas de piscina con aviso', checked: false },
            { id: uuidv4(), text: 'Espejo y mesa limpios', checked: false },
          ],
          photos: []
        },
        {
          id: uuidv4(),
          title: 'Cocina',
          items: [
            { id: uuidv4(), text: 'Revisar limpieza en vasos, platos, ollas', checked: false },
            { id: uuidv4(), text: 'Revisar bombillas', checked: false },
            { id: uuidv4(), text: '2 toallas de mano', checked: false },
          ],
          photos: [],
          subsections: [
            {
              id: uuidv4(),
              title: 'Cajones y Gabinetes de Isla',
              items: [],
              photos: [],
              subsections: [
                {
                  id: uuidv4(),
                  title: 'Primer Cajón Derecha de Estufa en la Esquina',
                  items: [
                    { id: uuidv4(), text: 'Utensilios de BBQ', checked: false },
                    { id: uuidv4(), text: 'Pinzas de cocina', checked: false },
                    { id: uuidv4(), text: 'Mezcladores', checked: false },
                    { id: uuidv4(), text: 'Encendedor', checked: false }
                  ],
                  photos: []
                },
                {
                  id: uuidv4(),
                  title: 'Segundo Cajón Derecha de Estufa',
                  items: [
                    { id: uuidv4(), text: 'Colador de pasta', checked: false },
                    { id: uuidv4(), text: 'Cucharones de servir ensalada', checked: false }
                  ],
                  photos: []
                },
                {
                  id: uuidv4(),
                  title: 'Tercer Cajón Derecha de Estufa',
                  items: [
                    { id: uuidv4(), text: 'Coladores de metal', checked: false },
                    { id: uuidv4(), text: 'Rallador', checked: false }
                  ],
                  photos: []
                }
              ]
            },
            {
              id: uuidv4(),
              title: 'Gabinetes Encima de Fregadero',
              items: [],
              photos: [],
              subsections: [
                {
                  id: uuidv4(),
                  title: 'Primer Gabinete a la Derecha de Microondas',
                  items: [
                    { id: uuidv4(), text: 'Azúcar', checked: false },
                    { id: uuidv4(), text: 'Sal', checked: false },
                    { id: uuidv4(), text: 'Pimienta', checked: false },
                    { id: uuidv4(), text: 'Filtros de café', checked: false },
                    { id: uuidv4(), text: 'Condimentos', checked: false },
                    { id: uuidv4(), text: 'Aceite', checked: false },
                    { id: uuidv4(), text: 'Revisar que no haya nada de comida abierto', checked: false }
                  ],
                  photos: []
                }
              ]
            },
            {
              id: uuidv4(),
              title: 'Refrigerador',
              items: [
                { id: uuidv4(), text: 'Revisar que no haya sucio ni migajas', checked: false },
                { id: uuidv4(), text: 'Enfriando correctamente', checked: false },
                { id: uuidv4(), text: 'Cajones y repisas de nevera limpios', checked: false },
                { id: uuidv4(), text: '6 aguas regulares', checked: false },
                { id: uuidv4(), text: '1 leche', checked: false },
                { id: uuidv4(), text: '6 medallas', checked: false }
              ],
              photos: []
            },
            {
              id: uuidv4(),
              title: 'Lavaplatos',
              items: [
                { id: uuidv4(), text: 'Sin agua en el fondo', checked: false },
                { id: uuidv4(), text: 'Todos los platos y utensilios removidos', checked: false },
                { id: uuidv4(), text: 'No olores', checked: false },
                { id: uuidv4(), text: 'Filtro limpio', checked: false },
                { id: uuidv4(), text: 'Reponer abrillantador "Rinse Aid"', checked: false }
              ],
              photos: []
            }
          ]
        },
        {
          id: uuidv4(),
          title: 'Amenidades de Bienvenida',
          items: [
            { id: uuidv4(), text: 'Nota de bienvenida', checked: false },
            { id: uuidv4(), text: 'Agua Fiji o similar', checked: false },
            { id: uuidv4(), text: 'Vino o vino espumoso', checked: false },
            { id: uuidv4(), text: 'Flautas o copas', checked: false },
            { id: uuidv4(), text: 'Amenidad de bienvenida (Treats)', checked: false },
            { id: uuidv4(), text: 'Amenidad de ocasión especial', checked: false },
            { id: uuidv4(), text: 'Pases físicos (De ser necesarios)', checked: false },
            { id: uuidv4(), text: 'Sacacorchos (De ser necesario)', checked: false },
            { id: uuidv4(), text: 'Hielo para CI', checked: false },
          ],
          photos: []
        }
      ]
    },
    {
      id: uuidv4(),
      title: 'Dormitorio Principal',
      items: [],
      subsections: [
        {
          id: uuidv4(),
          title: 'Baño Principal',
          items: [],
          photos: [],
          subsections: [
            {
              id: uuidv4(),
              title: 'Ducha',
              items: [
                { id: uuidv4(), text: 'Jabonera limpia', checked: false },
                { id: uuidv4(), text: '1 toalla de pies', checked: false },
                { id: uuidv4(), text: '2 toallas de baño', checked: false },
                { id: uuidv4(), text: 'Banquito limpio', checked: false }
              ],
              photos: []
            },
            {
              id: uuidv4(),
              title: 'Bañera',
              items: [
                { id: uuidv4(), text: 'Prenderla', checked: false },
                { id: uuidv4(), text: 'Limpia', checked: false },
                { id: uuidv4(), text: '2 sets de pantuflas', checked: false },
                { id: uuidv4(), text: 'Repelente de mosquitos /Off', checked: false },
                { id: uuidv4(), text: 'Bloqueador solar', checked: false },
                { id: uuidv4(), text: '2 toallas de baño', checked: false },
                { id: uuidv4(), text: '2 toallitas (washcloths)', checked: false },
                { id: uuidv4(), text: '1 toalla de pies', checked: false }
              ],
              photos: []
            },
            {
              id: uuidv4(),
              title: 'Área de Inodoro',
              items: [
                { id: uuidv4(), text: 'Revisar bombillos', checked: false },
                { id: uuidv4(), text: 'Revisar abanico', checked: false },
                { id: uuidv4(), text: 'Inodoro limpio y funcionando', checked: false },
                { id: uuidv4(), text: 'Zafacón limpio y vacío', checked: false },
                { id: uuidv4(), text: 'Pararse en pesa', checked: false },
                { id: uuidv4(), text: 'Cepillo de limpiar inodoro', checked: false },
                { id: uuidv4(), text: 'Bidet limpio y funcionando', checked: false }
              ],
              photos: []
            }
          ]
        },
        {
          id: uuidv4(),
          title: 'Armario Principal',
          items: [
            { id: uuidv4(), text: 'Revisar Bombillos', checked: false },
            { id: uuidv4(), text: 'Maletero', checked: false },
            { id: uuidv4(), text: 'Ganchos organizados por clase', checked: false },
            { id: uuidv4(), text: 'Caja fuerte funcionando', checked: false }
          ],
          photos: []
        },
        {
          id: uuidv4(),
          title: 'Área de Cama',
          items: [
            { id: uuidv4(), text: 'Revisar bombillos techo', checked: false },
            { id: uuidv4(), text: 'Cortinas limpias', checked: false },
            { id: uuidv4(), text: 'Revisar detrás de las cortinas', checked: false },
            { id: uuidv4(), text: '1 botella de agua en cada mesita de noche (2 total)', checked: false },
            { id: uuidv4(), text: 'Revisar bombillos mesitas de noche', checked: false },
            { id: uuidv4(), text: '4 almohadas king con pillow covers', checked: false },
            { id: uuidv4(), text: 'Mirar debajo de la cama', checked: false }
          ],
          photos: []
        }
      ],
      photos: []
    },
    {
      id: uuidv4(),
      title: 'Sala/Comedor',
      items: [],
      subsections: [
        {
          id: uuidv4(),
          title: 'Sala',
          items: [
            { id: uuidv4(), text: 'Revisar debajo de la alfombra', checked: false },
            { id: uuidv4(), text: 'Quitar cojines y revisar que no haya comida debajo', checked: false },
            { id: uuidv4(), text: 'Todas las almohadas decorativas limpias y en dirección correcta', checked: false },
            { id: uuidv4(), text: 'Sofá limpio', checked: false },
            { id: uuidv4(), text: 'Mirar debajo del sofá', checked: false },
            { id: uuidv4(), text: 'Encender televisor y verificar internet', checked: false },
            { id: uuidv4(), text: 'Control en mueble de TV', checked: false }
          ],
          photos: []
        },
        {
          id: uuidv4(),
          title: 'Comedor',
          items: [
            { id: uuidv4(), text: 'Mesa limpia', checked: false },
            { id: uuidv4(), text: 'Sillas organizadas', checked: false },
            { id: uuidv4(), text: 'Sillas fuertes', checked: false },
            { id: uuidv4(), text: 'Sillas limpias', checked: false }
          ],
          photos: []
        }
      ],
      photos: []
    },
    {
      id: uuidv4(),
      title: 'Lavandería',
      items: [
        { id: uuidv4(), text: 'Revisar bombillos', checked: false },
        { id: uuidv4(), text: 'Abrir gabinetes y que estén limpios y organizados', checked: false },
        { id: uuidv4(), text: 'Revisar encima de gabinetes', checked: false },
        { id: uuidv4(), text: 'Jabón de ropa', checked: false },
        { id: uuidv4(), text: 'Plancha', checked: false },
        { id: uuidv4(), text: 'Mesa de plancha', checked: false },
        { id: uuidv4(), text: 'Canasto de ropa vacío y limpio', checked: false }
      ],
      subsections: [],
      photos: []
    },
    {
      id: uuidv4(),
      title: 'Balcón',
      items: [
        { id: uuidv4(), text: 'Puertas y vidrios limpios', checked: false },
        { id: uuidv4(), text: 'Puertas abren sin problema', checked: false },
        { id: uuidv4(), text: 'Piso limpio sin arena', checked: false },
        { id: uuidv4(), text: 'Muebles limpios', checked: false },
        { id: uuidv4(), text: 'Muebles en puesto correcto', checked: false },
        { id: uuidv4(), text: 'Revisar bombillos', checked: false },
        { id: uuidv4(), text: 'Barandales fuertes', checked: false },
        { id: uuidv4(), text: 'Cojines de exterior: CO interior/ CI exterior', checked: false },
        { id: uuidv4(), text: 'Grill limpio', checked: false },
        { id: uuidv4(), text: 'Verificar que no haya escape de gas y encender', checked: false },
        { id: uuidv4(), text: 'Dejar gas cerrado', checked: false }
      ],
      subsections: [],
      photos: []
    },
    {
      id: uuidv4(),
      title: 'Carro de Golf',
      items: [
        { id: uuidv4(), text: 'Conectado', checked: false },
        { id: uuidv4(), text: 'Funcionando', checked: false },
        { id: uuidv4(), text: 'Limpio', checked: false },
        { id: uuidv4(), text: 'Llenar papel de inspección y enviarlo', checked: false }
      ],
      subsections: [],
      photos: []
    }
  ]
};