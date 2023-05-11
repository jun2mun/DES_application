data = {
    datasets: [
        {
            label: 'query',
            data: [10, 20, 30, 40,50,50,70],
            // this dataset is drawn below
            order: 1,
            type: 'bar'
        },
        {
            label: 'photos',
            data: [10, 20, 30, 40,50,50,70],
            // this dataset is drawn below
            order: 2,
            type: 'bar'
        },

    ],
    labels: ['월', '화', '수', '목','금','토','일']
}


let new_data =  {...data};
console.log(new_data.labels)