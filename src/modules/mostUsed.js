
const {box} = require('../components/box.js');
const {button} = require('../components/button.js');


class most_useds {
    constructor($body,$data){
        this.$body = $body;
        this.show_item_cnt = 4
        this.data = undefined
    }
    async fetch_data(data){
        let result = await decode_to_mostuseddata(data)
        this.data = result
    }

    decode_to_mostuseddata(data){
        let new_data = data
        let temp_total_time = 0 // 스크린 타임
        let duplicate = false // 중복 여부 체크

        new_data.datasets=[]
        new_data.labels = ['월', '화', '수', '목','금','토','일']
            
        for (let idx=0;idx<=(data.length-1);idx++){
            
            let results = data[idx]
            results.forEach((result,index) => {
                
                duplicate = false
                let dup_index = undefined
                
                temp_total_time += result.difference
                
                // 중복 요소 탐색 //
                new_data.datasets.forEach((data,index)=>{
                    if (data.label == result.name){
                        duplicate = true
                        dup_index = index
                    }
                })
                
                // 중복 여부에 따라 다르게 처리 //
                if (!duplicate){
                    new_data.datasets.push({
                        label : `${result.name}`, data: [0*(data.length)], order : index, type : 'bar',eye_cnt : 0
                    })
                    new_data.datasets[new_data.datasets.length-1].data[idx] = result.difference
                    new_data.datasets[new_data.datasets.length-1].eye_cnt = result.count // 눈 깜박
                }
                if (dup_index != undefined) {
                    new_data.datasets[dup_index].data[idx] = result.difference
                    new_data.datasets[dup_index].eye_cnt = result.count // 눈 깜박
                }

            })    
        }

        const dataset = []
        
        for (let i =0; i < data.datasets.length; i ++){
            let time_used = data.datasets[i].data.reduce((sum, num) => sum + num); // 7일 기준 sum
            dataset.push(
                { icon : './public/assets/icon.svg', title : `${(data.datasets[i].label).split('.exe',1)}`, progressbar :`${time_used.toFixed(1)}`,cnt : `${time_used.toFixed(1)}`,eye_cnt : `${((data.datasets[i].eye_cnt) /time_used).toFixed(1)}` }, // 1번. TODO 아이콘을 가져와야 함 2번. progressbar 디자인을 바꿔야됨.
            )
        }
        return dataset
    }

    render(){
        this.$body.innerHTML = '';

        const MostUsed = box($div,'MOST USED');
        
        for (let i = 0;i < the_top_few; i++){
            const element = document.createElement('div');
            element.setAttribute("class",'graph_element')
            //element.onclick = routing;
            const icon = document.createElement('img');
            icon.src = dataset[i]['icon']

            const contents = document.createElement('div');
            const content_title = document.createElement('div');
            content_title.innerText = dataset[i]['title'];
            const content_detail = document.createElement('div');
            
            const bar = document.createElement('progress');
            bar.max='100'; bar.value= dataset[i]['progressbar']
            const use_time = document.createTextNode(` ${dataset[i].cnt} min`)

            const eye_cnt = document.createElement('div')
            eye_cnt.innerHTML = `평균(${dataset[i]['eye_cnt']}회)`
            //eye_cnt.style.border = 'solid';
            eye_cnt.style.display = 'flex';
            eye_cnt.style.alignItems = 'center'
            eye_cnt.style.fontSize = '14px';

            const predict = document.createElement('div')
            predict.innerHTML = `1시간 이내 휴식 요망`
            //eye_cnt.style.border = 'solid';
            predict.style.display = 'flex';
            predict.style.alignItems = 'center'
            predict.style.fontSize = '14px';

            contents.appendChild(content_title)
            content_detail.appendChild(bar)
            content_detail.appendChild(use_time);
            contents.appendChild(content_detail)
            element.appendChild(icon)
            element.appendChild(contents)
            element.appendChild(eye_cnt)
            element.appendChild(predict)

            button(element,`O`,`#detail#${dataset[i]['title']}`)
            MostUsed.appendChild(element)
            element.style.background = 'white'
            element.style.borderRadius = '3%';
            element.style.display = 'flex';
            element.style.justifyContent = 'space-between'
            element.style.padding = '10px'
            if (i === 0) {
                element.style.borderTop = 'solid';
            }
            if (i != 2){
                element.style.borderBottom = 'solid';
            };
            if (i === 2){
                element.style.borderBottom = 'solid';
            };

        }

        //MostUsed.style.border = 'solid'
        MostUsed.style.width = 'auto';
        return element
        }
}
// mout used 컴포넌트
function most_used($div,data,show_item_cnt){

    // DECODE //
    let dataset = []
    dataset = decode_to_mostuseddata(data)

    
    // 렌더링 부분
    const MostUsed = box($div,'MOST USED');
    
    for (let i = 0;i < show_item_cnt; i++){
        const element = document.createElement('div');
        element.setAttribute("class",'graph_element')
        //element.onclick = routing;
        const icon = document.createElement('img');
        icon.src = dataset[i]['icon']

        const contents = document.createElement('div');
        const content_title = document.createElement('div');
        content_title.innerText = dataset[i]['title'];
        const content_detail = document.createElement('div');
        
        const bar = document.createElement('progress');
        bar.max='100'; bar.value= dataset[i]['progressbar']
        const use_time = document.createTextNode(` ${dataset[i].cnt} min`)

        const eye_cnt = document.createElement('div')
        eye_cnt.innerHTML = `평균(${dataset[i]['eye_cnt']}회)`
        //eye_cnt.style.border = 'solid';
        eye_cnt.style.display = 'flex';
        eye_cnt.style.alignItems = 'center'
        eye_cnt.style.fontSize = '14px';

        const predict = document.createElement('div')
        predict.innerHTML = `1시간 이내 휴식 요망`
        //eye_cnt.style.border = 'solid';
        predict.style.display = 'flex';
        predict.style.alignItems = 'center'
        predict.style.fontSize = '14px';

        contents.appendChild(content_title)
        content_detail.appendChild(bar)
        content_detail.appendChild(use_time);
        contents.appendChild(content_detail)
        element.appendChild(icon)
        element.appendChild(contents)
        element.appendChild(eye_cnt)
        element.appendChild(predict)

        button(element,`O`,`#detail#${dataset[i]['title']}`)
        MostUsed.appendChild(element)
        element.style.background = 'white'
        element.style.borderRadius = '3%';
        element.style.display = 'flex';
        element.style.justifyContent = 'space-between'
        element.style.padding = '10px'
        if (i === 0) {
            element.style.borderTop = 'solid';
        }
        if (i != 2){
            element.style.borderBottom = 'solid';
        };
        if (i === 2){
            element.style.borderBottom = 'solid';
        };

    }

    //MostUsed.style.border = 'solid'
    MostUsed.style.width = 'auto';
    return element
    
}

function decode_to_mostuseddata(data){
    let new_data = data
    let temp_total_time = 0 // 스크린 타임
    let duplicate = false // 중복 여부 체크

    new_data.datasets=[]
    new_data.labels = ['월', '화', '수', '목','금','토','일']
        
    for (let idx=0;idx<=(data.length-1);idx++){
        
        let results = data[idx]
        results.forEach((result,index) => {
            
            duplicate = false
            let dup_index = undefined
            
            temp_total_time += result.difference
            
            // 중복 요소 탐색 //
            new_data.datasets.forEach((data,index)=>{
                if (data.label == result.name){
                    duplicate = true
                    dup_index = index
                }
            })
            
            // 중복 여부에 따라 다르게 처리 //
            if (!duplicate){
                new_data.datasets.push({
                    label : `${result.name}`, data: [0*(data.length)], order : index, type : 'bar',eye_cnt : 0
                })
                new_data.datasets[new_data.datasets.length-1].data[idx] = result.difference
                new_data.datasets[new_data.datasets.length-1].eye_cnt = result.count // 눈 깜박
            }
            if (dup_index != undefined) {
                new_data.datasets[dup_index].data[idx] = result.difference
                new_data.datasets[dup_index].eye_cnt = result.count // 눈 깜박
            }

        })    
    }

    const dataset = []
    
    for (let i =0; i < data.datasets.length; i ++){
        let time_used = data.datasets[i].data.reduce((sum, num) => sum + num); // 7일 기준 sum
        dataset.push(
            { icon : './public/assets/icon.svg', title : `${(data.datasets[i].label).split('.exe',1)}`, progressbar :`${time_used.toFixed(1)}`,cnt : `${time_used.toFixed(1)}`,eye_cnt : `${((data.datasets[i].eye_cnt) /time_used).toFixed(1)}` }, // 1번. TODO 아이콘을 가져와야 함 2번. progressbar 디자인을 바꿔야됨.
        )
    }
    return dataset
}
exports.most_used = most_used;
exports.most_useds = most_useds;
