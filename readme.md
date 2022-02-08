Ученический проект - магазин на Node.
Использовал Express, Pug, Mustard (Css-фреймворк), MySQL БД, 
хеширование паролей (функция bcrypt).
----
для себя: схема работы магазина
- есть БД товаров (название, цена, описание, краткое имя, имя картинки)
- попадая на главную, по гет-запросу "/" делается запрос в БД, выкачиваются все 
товары, передаются через view-engine в pug и там отрисовываются.
- на каждом товаре есть ссылка <a> типа /item/краткое-имя (взятое из БД во время отрисовки)
- ...а также кнопка "добавить в корзину", содержащая goodsId = id этого товара из БД;
- скрипт cart.js, в который кладётся нажатый товар
- когда в список заказанного (объект) попал товар, через post по адресу /get-goods-info
идёт обращение в БД за товарами с данным id (я бы сделал хеширование, чтобы не дёргать БД,
но надо подумать - если за время лазанья по сайту товары раскупили??)
- скрипт cart.js, естественно, работает с localStorage(чтобы не терять данные
при перезагрузке страницы)
 - также есть админка, использующая куки и middleware. То есть для пары адресов
сначала идёт проверка, если в куках есть сохранённые данные для входа и они
совпадают с данными в БД, то middleware пускает дальше. Если нет - отправит
на страницу входа. Там при введении данных и нажатии идёт проверка по БД (!внимание - проверка
по логину и "голому" паролю из пост-запроса), если есть совпадение - в куку запишется хеш.
Полагаю, нельзя хранить в БД пароль вообще, только хеш, и отправлять на сравнение
хеш от введённого пароля.