var Chart = window.Chart;

var ItemForm = React.createClass({
    getInitialState : function(){
        return {category:'Food', title:'', price:0.0};
    },
    setValue: function(event) {
        var price = event.target.value;
        this.setState({price:price});
    },
    setItemName: function(event) {
        var title = event.target.value;
        this.setState({title:title});
    },
    setCategory: function(event) {
        var category = event.target.value;
        this.setState({category: category});
    },
    createItem: function() {
        var data = this.state
        var date = $(this.getDOMNode()).find('#datepicker').datepicker('getDate');
        var self = this;

        if(date)
            data.date = date;
        
        $.ajax({
            url: this.props.url,
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data),
            method: "POST",
            success:
                function() {
                    self.refs.chart.getData();
                    console.log('success');
                }
        })
    }, 
    render: function() {
        var price = this.state.price;
        var title = this.state.title;
        var category = this.state.category;

        return (
            <div className='col-md-offset-2 col-md-8'>
                <div>
                    <Chart ref='chart' width={700} height={400}  url='/api/item/graph'/>
                </div>
                <div>
                    <label for='item-name'>Item Name</label>
                    <input value={title} id='item-name' onChange={this.setItemName} type='text' />
                    <label for='item-price'>Costs Spent</label>
                    <input value={price} id='item-price' onChange={this.setValue} type='text' />
                    <label for='item-datepicker'>Datepicker</label>
                    <input type="text" id="datepicker" />
                    <label for='item-category'>Category</label>
                    <select value={category} onChange={this.setCategory} id='item-category' >
                        <option>Food</option>
                        <option>Medicine</option>
                        <option>Domestic</option>
                        <option>Bills</option>
                        <option>Fun</option>
                        <option>Misc</option>
                    </select>
                    <button onClick={this.createItem}>Submit</button>
                </div>
            </div>
        )
    },
    componentDidMount: function() {
        $(this.getDOMNode()).find('#datepicker')
            .datepicker();

        this.setState(this.data)
    }
});

ReactDOM.render(
    <ItemForm url='/api/item' />,

    document.getElementById('content')
);