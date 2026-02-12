--
-- PostgreSQL database dump
--

\restrict GecaOezc1IsHOOCaeyWfq46U1dK5fqcRQHH6CWB5wu9spD19ap7xNQmfiqCW4mW

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-02-13 01:17:52

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 5057 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 33264)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    category_id integer NOT NULL,
    category_name character varying(100)
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 33263)
-- Name: categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_category_id_seq OWNER TO postgres;

--
-- TOC entry 5058 (class 0 OID 0)
-- Dependencies: 221
-- Name: categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_category_id_seq OWNED BY public.categories.category_id;


--
-- TOC entry 226 (class 1259 OID 33296)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    order_id integer NOT NULL,
    product_id integer,
    user_id integer,
    status character varying(50) DEFAULT 'Pending'::character varying,
    order_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 33295)
-- Name: orders_order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_order_id_seq OWNER TO postgres;

--
-- TOC entry 5059 (class 0 OID 0)
-- Dependencies: 225
-- Name: orders_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_order_id_seq OWNED BY public.orders.order_id;


--
-- TOC entry 224 (class 1259 OID 33275)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    product_id integer NOT NULL,
    product_name text NOT NULL,
    product_description text DEFAULT 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. 
        Eos voluptatibus consequuntur, iste ea culpa distinctio officia atque veritatis maiores doloremque ab officiis repellat, 
        rerum quia eaque placeat? Aliquam, voluptate numquam!'::text,
    category_id integer,
    price numeric(10,2) NOT NULL,
    rating numeric(2,1) DEFAULT NULL::numeric,
    thumbnail text DEFAULT NULL::character varying,
    sold integer DEFAULT 0
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 33274)
-- Name: products_product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_product_id_seq OWNER TO postgres;

--
-- TOC entry 5060 (class 0 OID 0)
-- Dependencies: 223
-- Name: products_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_product_id_seq OWNED BY public.products.product_id;


--
-- TOC entry 220 (class 1259 OID 33246)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    login character varying(50) NOT NULL,
    password character varying(100) NOT NULL,
    name character varying(100) NOT NULL,
    status integer DEFAULT 1,
    role character varying(5) DEFAULT 'user'::character varying,
    registered_at timestamp with time zone DEFAULT now(),
    address text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 33245)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- TOC entry 5061 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 4875 (class 2604 OID 33267)
-- Name: categories category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN category_id SET DEFAULT nextval('public.categories_category_id_seq'::regclass);


--
-- TOC entry 4881 (class 2604 OID 33299)
-- Name: orders order_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN order_id SET DEFAULT nextval('public.orders_order_id_seq'::regclass);


--
-- TOC entry 4876 (class 2604 OID 33278)
-- Name: products product_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN product_id SET DEFAULT nextval('public.products_product_id_seq'::regclass);


--
-- TOC entry 4871 (class 2604 OID 33249)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 5047 (class 0 OID 33264)
-- Dependencies: 222
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (category_id, category_name) FROM stdin;
1	Miscellaneous / Special Collectibles
2	Outdoor & Travel Souvenirs
3	Home Decor & Lighting
4	Sports & Fitness Collectibles
5	Dining & Tableware
6	Drink & Coffee Collectibles
7	Kitchen & Cooking Souvenirs
8	Food & Traditional Recipes
\.


--
-- TOC entry 5051 (class 0 OID 33296)
-- Dependencies: 226
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (order_id, product_id, user_id, status, order_date) FROM stdin;
6	14	3	Pending	2026-02-12 20:51:15.556962
7	17	2	Pending	2026-02-12 20:51:59.511698
\.


--
-- TOC entry 5049 (class 0 OID 33275)
-- Dependencies: 224
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (product_id, product_name, product_description, category_id, price, rating, thumbnail, sold) FROM stdin;
4	Temple Kitchen Heritage Tofu Bites	Inspired by traditional temple cooking methods.	8	22.99	0.3	\N	0
21	Ancient Scroll Paperweight	Paperweight shaped like a rolled ancient scroll.	8	29.99	0.4	\N	0
22	Historic Compass Replica	Collector’s compass inspired by explorers of the 18th century.	8	39.99	4.6	\N	0
23	Festival Mask Ornament	Colorful festival mask to display as wall decor.	8	24.99	4.0	\N	0
24	Miniature Temple Bell	Small brass bell souvenir inspired by sacred temples.	8	22.99	2.1	\N	0
25	Historic Map Coaster Set	Coasters with ancient map prints.	8	19.99	2.2	\N	0
26	Ceremonial Feather Quill	Replica feather quill inspired by historical writing instruments.	8	14.99	0.6	\N	0
27	Explorer Compass Pendant	Pendant shaped like an antique explorer compass.	7	39.99	1.3	\N	0
28	Trailblazer Hiking Stick	Handcrafted souvenir hiking stick.	7	49.99	0.2	\N	0
29	Antique Map Travel Journal	Journal featuring antique world maps.	7	29.99	1.1	\N	0
30	Mountain Summit Flag Set	Miniature flags from historical mountaineering expeditions.	7	34.99	2.4	\N	0
31	Historic Globe Miniature	Desk-sized globe inspired by old cartography.	7	59.99	5.0	\N	0
32	Explorer Survival Kit	Mini souvenir kit inspired by historical explorers.	7	44.99	0.6	\N	0
33	Vintage Travel Tag Set	Souvenir luggage tags inspired by early 20th-century travel.	7	19.99	2.8	\N	0
34	Ancient Lantern Replica	Decorative lantern inspired by medieval street lamps.	6	74.99	4.2	\N	0
35	Temple Window Candle Holder	Ornate candle holder modeled after ancient temple windows.	6	64.99	2.4	\N	0
36	Royal Court Tapestry Mini	Small decorative tapestry inspired by royal palaces.	6	89.99	1.6	\N	0
37	Sunstone Desk Lamp	Lamp with amber-colored glass inspired by ancient navigation tools.	6	109.99	1.8	\N	0
38	Ceremonial Wall Mirror	Small decorative mirror reflecting historical ceremonial designs.	6	69.99	4.3	\N	0
39	Festival Light Garland	Indoor garland lights inspired by traditional festivals.	6	49.99	1.9	\N	0
41	Historic Archery Set Replica	Mini decorative bow and arrow set.	5	44.99	1.8	\N	0
42	Champion Track Medal Replica	Souvenir medal inspired by historical championships.	5	34.99	2.3	\N	0
43	Royal Equestrian Mini Horse	Decorative mini horse figurine from historic stables.	5	49.99	1.3	\N	0
44	Medieval Javelin Replica	Miniature decorative javelin inspired by historic athletics.	5	39.99	4.2	\N	0
45	Ancient Gymnastics Balance Beam	Miniature souvenir beam inspired by classical gymnastic apparatus.	5	44.99	4.0	\N	0
10	Royal Banquet Fondue Ensemble	Commemorative dining set inspired by 18th-century royal banquets.	5	179.99	0.5	\N	0
5	Festival Edition Chocolate Tribute Bars	Commemorative sweets celebrating the annual cultural festival.	7	29.99	3.7	\N	0
6	Roman Caesar Legacy Dressing	Recreation of a Roman-inspired culinary blend.	7	27.99	0.1	\N	0
7	Artisan Candle Workshop Relic Kit	DIY kit honoring historic candle-making guilds.	7	129.99	2.8	\N	0
8	Summit Expedition Engraved Bottle	Souvenir bottle commemorating mountain ascents.	6	49.99	3.2	\N	0
9	Vintage Café Capsule Vault	Collector’s coffee organizer inspired by 1950s cafés.	6	89.99	1.0	\N	0
11	Scholar’s Hall Magnetic Board	Inspired by historic university lecture halls.	5	119.99	0.6	\N	0
12	City Marathon Limited Sneakers 2025	Collector’s edition sneakers for the 2025 marathon.	4	149.99	3.7	\N	0
15	Festival of Lights Collector LED Set	Limited decorative lights celebrating cultural heritage.	3	149.99	4.9	\N	0
16	Centennial Solar Lantern Collection	Eco-friendly lanterns released for innovation anniversary.	3	139.99	0.8	\N	0
18	Global Resilience Memorial Mask Set	Commemorative set symbolizing a historic global era.	2	59.99	4.2	\N	0
19	Timekeeper Pocket Sundial	Miniature sundial souvenir inspired by ancient timekeeping.	8	34.99	3.6	\N	0
20	Miniature Viking Shield Replica	Hand-painted miniature shield from the Viking era.	8	49.99	1.1	\N	0
17	Explorer Expedition Waterproof Boots	Inspired by historic polar expeditions, limited release.	2	189.99	3.1	\N	1
46	Royal Banquet Goblet Set	Collector’s goblets inspired by historical banquets.	4	129.99	4.0	\N	0
47	Ceremonial Plate Collection	Decorative plates with traditional festival motifs.	4	99.99	2.9	\N	0
48	Medieval Cutlery Replica Set	Mini decorative cutlery inspired by the Middle Ages.	4	89.99	0.3	\N	0
49	Heritage Tea Cup Set	Mini souvenir tea cups from traditional tea ceremonies.	4	79.99	1.3	\N	0
50	Antique Spice Dish	Decorative dish inspired by historical spice trade.	4	69.99	4.9	\N	0
51	Festival Dining Mat Set	Souvenir mats inspired by traditional festival meals.	4	49.99	3.6	\N	0
52	Colonial Coffee Grinder Mini	Mini grinder inspired by colonial-era coffee tools.	3	54.99	1.8	\N	0
53	Vintage Apothecary Tea Jar	Decorative jar inspired by old apothecary containers.	3	49.99	4.8	\N	0
54	Explorer Flask Replica	Mini collectible flask inspired by historical explorers.	3	44.99	1.8	\N	0
13	Championship Legacy Tailgating Set	Limited sports championship commemorative grilling set.	4	249.99	4.3	\N	0
55	Colonial Era Coffee Cup Set	Collector cups inspired by early coffee houses.	3	59.99	0.4	\N	0
56	Antique Spice Infused Tea Blend	Specialty souvenir tea inspired by historic trade spices.	3	39.99	4.0	\N	0
57	Historic Pastry Rolling Pin	Collector’s rolling pin inspired by 18th-century baking tools.	2	34.99	4.4	\N	0
60	Medieval Spice Rack Mini	Collector spice rack inspired by historical kitchens.	2	39.99	1.7	\N	0
61	Historic Bread Baking Mold	Mini souvenir mold inspired by old baking methods.	2	29.99	4.1	\N	0
62	Colonial Butter Churn Mini	Souvenir butter churn inspired by historical kitchens.	2	34.99	4.5	\N	0
63	Harvest Festival Honey Cakes	Mini honey cakes inspired by traditional harvest rituals.	1	24.99	2.4	\N	0
64	Ancient Grain Snack Mix	Souvenir snack mix inspired by historic grains.	1	19.99	1.3	\N	0
65	Temple Ceremony Rice Cakes	Commemorative rice cakes from historical temple recipes.	1	29.99	3.5	\N	0
66	Monastic Herbal Biscuit Set	Herbal biscuits inspired by monastery kitchens.	1	34.99	3.8	\N	0
67	Festival Spiced Nut Mix	Collector souvenir nut mix inspired by festival recipes.	1	24.99	3.0	\N	0
68	Ancient Orchard Fruit Conserve	Limited edition fruit conserve inspired by historic orchards.	1	29.99	1.4	\N	0
14	Centennial Artisan Fire Bowl	Handcrafted fire bowl celebrating 100 years of artisan design.	3	299.99	3.2	\N	1
\.


--
-- TOC entry 5045 (class 0 OID 33246)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, login, password, name, status, role, registered_at, address) FROM stdin;
2	aruzhan	$2b$12$PbXiqoQ7jyr/.2hPnlJ/...94fo1WPPtYx.TYVWDloP3noC5SDt5m	Aruzhan	1	user	2026-02-12 17:54:46.893943+05	\N
1	yerah	$2b$12$4vMfJPzckemal4yr1vietON9Yg.coHevoeaLF/tGklj198OhnW4O.	Administrator	1	admin	2026-02-12 17:23:43.50912+05	\N
3	A	$2b$12$88RIe1jxVPVc5kUEC71SzubYZvOrwRhWjE7KKmY4X13tbz8pAS4k6	B	1	user	2026-02-12 20:51:11.788233+05	\N
\.


--
-- TOC entry 5062 (class 0 OID 0)
-- Dependencies: 221
-- Name: categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_category_id_seq', 8, true);


--
-- TOC entry 5063 (class 0 OID 0)
-- Dependencies: 225
-- Name: orders_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_order_id_seq', 7, true);


--
-- TOC entry 5064 (class 0 OID 0)
-- Dependencies: 223
-- Name: products_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_product_id_seq', 70, true);


--
-- TOC entry 5065 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 3, true);


--
-- TOC entry 4889 (class 2606 OID 33273)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- TOC entry 4893 (class 2606 OID 33304)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- TOC entry 4891 (class 2606 OID 33289)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- TOC entry 4885 (class 2606 OID 33262)
-- Name: users users_login_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_login_key UNIQUE (login);


--
-- TOC entry 4887 (class 2606 OID 33260)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4895 (class 2606 OID 33305)
-- Name: orders orders_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE SET NULL;


--
-- TOC entry 4896 (class 2606 OID 33310)
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4894 (class 2606 OID 33290)
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE SET NULL;


-- Completed on 2026-02-13 01:17:52

--
-- PostgreSQL database dump complete
--

\unrestrict GecaOezc1IsHOOCaeyWfq46U1dK5fqcRQHH6CWB5wu9spD19ap7xNQmfiqCW4mW

