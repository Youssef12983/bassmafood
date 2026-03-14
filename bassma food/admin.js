let recipes = JSON.parse(localStorage.getItem("recipes")) || [];

const form = document.getElementById("recipeForm");
const recipeList = document.getElementById("recipeList");

function displayRecipes(){

recipeList.innerHTML = "";

recipes.forEach((recipe,index)=>{

const div = document.createElement("div");
div.className="recipe-item-admin";

div.innerHTML = `
<span>${recipe.title}</span>

<div class="actions">
<button onclick="deleteRecipe(${index})">Delete</button>
</div>
`;

recipeList.appendChild(div);

});

}

form.addEventListener("submit",function(e){

e.preventDefault();

const title = document.getElementById("title").value;
const category = document.getElementById("category").value;
const image = document.getElementById("image").value;

const ingredients = document
.getElementById("ingredients")
.value.split(",");

const steps = document
.getElementById("steps")
.value.split(",");

const recipe = {

title,
category,
image,
ingredients,
steps

};

recipes.push(recipe);

localStorage.setItem("recipes",JSON.stringify(recipes));

form.reset();

displayRecipes();

});


function deleteRecipe(index){

recipes.splice(index,1);

localStorage.setItem("recipes",JSON.stringify(recipes));

displayRecipes();

}

displayRecipes();